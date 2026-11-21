// ==============================================================================
// KAABIL (काबिल) — Signup & Authentication Flow Verification Suite
// Tests student/institution/employer registration, DPDP minor safeguards,
// duplicate protection, session cookie issuance, and subsequent login flow.
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as registerHandler } from "../app/api/auth/register/route";
import { POST as loginHandler } from "../app/api/auth/login/route";
import { devStore } from "../lib/dev-store";
import { SESSION_COOKIE_NAME } from "../lib/auth/session";
import { resetRateLimit } from "../lib/auth/rate-limiter";

function createJsonPostRequest(url: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.1",
      "user-agent": "Kaabil-Vitest-Client",
    },
    body: JSON.stringify(body),
  });
}

describe("KAABIL Universal Signup Flow & Security Verification", () => {
  beforeEach(() => {
    devStore.reset();
  });

  describe("Student Registration Flow", () => {
    it("successfully registers an adult undergraduate student and issues session cookie", async () => {
      const uniqueEmail = `aryan.learner.${Date.now()}@example.in`;
      const req = createJsonPostRequest("http://localhost:3000/api/auth/register", {
        role: "STUDENT",
        name: "Aryan Sharma",
        email: uniqueEmail,
        password: "StrongStudentPass#2026",
        educationStage: "UNDERGRADUATE",
        guardianConsent: true,
        city: "Pune",
        state: "Maharashtra",
      });

      const res = await registerHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe(uniqueEmail.toLowerCase());
      expect(data.user.role).toBe("STUDENT");
      expect(data.user.isMinor).toBe(false);
      expect(data.user.studentProfile.educationStage).toBe("UNDERGRADUATE");

      // Verify HTTP-Only Session Cookie
      const setCookieHeader = res.headers.get("set-cookie");
      expect(setCookieHeader).toContain(SESSION_COOKIE_NAME);

      // Verify persistence in devStore
      const savedUser = devStore.getUserByEmail(uniqueEmail);
      expect(savedUser).toBeDefined();
      expect(savedUser?.name).toBe("Aryan Sharma");
    });

    it("enforces DPDP Act 2023: blocks minor registration when parental consent is missing", async () => {
      const minorEmail = `minor.school.${Date.now()}@example.in`;
      const req = createJsonPostRequest("http://localhost:3000/api/auth/register", {
        role: "STUDENT",
        name: "Rohan Verma",
        email: minorEmail,
        password: "SchoolStudentPass#2026",
        educationStage: "CLASS_10", // Secondary school minor
        guardianConsent: false, // Consent NOT granted
      });

      const res = await registerHandler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("DPDP Act 2023");

      // Verify user was NOT saved
      const savedUser = devStore.getUserByEmail(minorEmail);
      expect(savedUser).toBeNull();
    });

    it("allows minor registration when parental consent is affirmatively granted", async () => {
      const minorEmail = `minor.verified.${Date.now()}@example.in`;
      const req = createJsonPostRequest("http://localhost:3000/api/auth/register", {
        role: "STUDENT",
        name: "Diya Patel",
        email: minorEmail,
        password: "MinorStudentPass#2026",
        educationStage: "CLASS_11", // Senior secondary minor
        guardianConsent: true, // Affirmative parental consent
        city: "Ahmedabad",
        state: "Gujarat",
      });

      const res = await registerHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.isMinor).toBe(true);
      expect(data.user.studentProfile.educationStage).toBe("CLASS_11");
    });

    it("rejects weak password shorter than 8 characters", async () => {
      const req = createJsonPostRequest("http://localhost:3000/api/auth/register", {
        role: "STUDENT",
        name: "Short Pass",
        email: "shortpass@example.in",
        password: "123",
        educationStage: "UNDERGRADUATE",
      });

      const res = await registerHandler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("Validation failed");
    });

    it("prevents duplicate registration with an already registered email (409 Conflict)", async () => {
      const dupEmail = "duplicate.test@kaabil.in";

      // First registration
      const req1 = createJsonPostRequest("http://localhost:3000/api/auth/register", {
        role: "STUDENT",
        name: "First Registrant",
        email: dupEmail,
        password: "ValidPassword123#",
        educationStage: "UNDERGRADUATE",
      });
      const res1 = await registerHandler(req1);
      expect(res1.status).toBe(200);

      // Duplicate registration attempt
      const req2 = createJsonPostRequest("http://localhost:3000/api/auth/register", {
        role: "STUDENT",
        name: "Second Registrant",
        email: dupEmail,
        password: "AnotherPassword123#",
        educationStage: "UNDERGRADUATE",
      });
      const res2 = await registerHandler(req2);
      const data2 = await res2.json();

      expect(res2.status).toBe(409);
      expect(data2.error).toContain("already exists");
    });
  });

  describe("Institution & Employer Registration Flow", () => {
    it("successfully registers an Institution / College workspace", async () => {
      const instEmail = `dean.dtu.${Date.now()}@university.edu.in`;
      const req = createJsonPostRequest("http://localhost:3000/api/auth/register", {
        role: "INSTITUTION_ADMIN",
        name: "Dr. K. S. Murthy",
        email: instEmail,
        password: "InstitutionSecurePass#2026",
        organizationName: "National Institute of Technology",
        orgType: "COLLEGE_UNIVERSITY",
        city: "Warangal",
        state: "Telangana",
      });

      const res = await registerHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.role).toBe("INSTITUTION_ADMIN");
      expect(data.user.organizations.length).toBeGreaterThan(0);
      expect(data.user.organizations[0].name).toBe("National Institute of Technology");
    });

    it("successfully registers a Corporate Employer workspace", async () => {
      const empEmail = `talent.${Date.now()}@tatamedtech.in`;
      const req = createJsonPostRequest("http://localhost:3000/api/auth/register", {
        role: "EMPLOYER_ADMIN",
        name: "Pooja Hegde",
        email: empEmail,
        password: "CorporateSecurePass#2026",
        organizationName: "Tata Medical & Healthcare Technologies",
        orgType: "HEALTHCARE_ORG",
        city: "Bengaluru",
        state: "Karnataka",
      });

      const res = await registerHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.role).toBe("EMPLOYER_ADMIN");
      expect(data.user.organizations[0].name).toBe("Tata Medical & Healthcare Technologies");
    });
  });

  describe("Complete Signup-to-Login Closed Loop", () => {
    it("allows a newly registered user to log in immediately with their custom credentials", async () => {
      const userEmail = `fresh.learner.${Date.now()}@example.in`;
      const userPassword = "FreshCustomPassword#2026";

      // 1. Sign up
      const signupReq = createJsonPostRequest("http://localhost:3000/api/auth/register", {
        role: "STUDENT",
        name: "Fresh Student",
        email: userEmail,
        password: userPassword,
        educationStage: "UNDERGRADUATE",
        city: "Chandigarh",
        state: "Punjab",
      });

      const signupRes = await registerHandler(signupReq);
      expect(signupRes.status).toBe(200);

      // 2. Log in with newly registered credentials
      const loginReq = createJsonPostRequest("http://localhost:3000/api/auth/login", {
        email: userEmail,
        password: userPassword,
        rememberMe: true,
      });

      const loginRes = await loginHandler(loginReq);
      const loginData = await loginRes.json();

      expect(loginRes.status).toBe(200);
      expect(loginData.success).toBe(true);
      expect(loginData.user.email).toBe(userEmail.toLowerCase());
      expect(loginData.user.name).toBe("Fresh Student");
      expect(loginData.user.role).toBe("STUDENT");

      // Verify Session Cookie was issued
      const cookie = loginRes.headers.get("set-cookie");
      expect(cookie).toContain(SESSION_COOKIE_NAME);
    });

    it("rejects login attempt with incorrect password for newly registered user", async () => {
      const userEmail = `auth.test.${Date.now()}@example.in`;
      const correctPass = "CorrectPassword#2026";

      // Sign up
      await registerHandler(
        createJsonPostRequest("http://localhost:3000/api/auth/register", {
          role: "STUDENT",
          name: "Auth Test User",
          email: userEmail,
          password: correctPass,
          educationStage: "POSTGRADUATE",
        })
      );

      // Attempt login with wrong password
      const wrongLoginReq = createJsonPostRequest("http://localhost:3000/api/auth/login", {
        email: userEmail,
        password: "IncorrectPassword123#",
      });

      const wrongRes = await loginHandler(wrongLoginReq);
      const wrongData = await wrongRes.json();

      expect(wrongRes.status).toBe(401);
      expect(wrongData.error).toBe("Invalid email or password.");
    });

    it("enforces rate-limiting after 5 consecutive failed login attempts", async () => {
      const email = `ratelimit.target.${Date.now()}@example.in`;
      resetRateLimit(`login:${email}`);

      // Perform 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await loginHandler(
          createJsonPostRequest("http://localhost:3000/api/auth/login", {
            email,
            password: "WrongPassword123#",
          })
        );
      }

      // 6th attempt should be blocked by rate limiter
      const blockedRes = await loginHandler(
        createJsonPostRequest("http://localhost:3000/api/auth/login", {
          email,
          password: "WrongPassword123#",
        })
      );

      expect(blockedRes.status).toBe(429);
      const blockedData = await blockedRes.json();
      expect(blockedData.error).toContain("Too many failed login attempts");

      resetRateLimit(`login:${email}`);
    });
  });
});
