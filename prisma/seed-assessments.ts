import { prisma } from "../src/lib/db";
import { KAABIL_ASSESSMENTS } from "../src/data/assessmentsData";

function mapToEducationalStream(stream: string): any {
  if (stream === "CREATIVE_ARTS_DESIGN") return "CREATIVE_DESIGN";
  if (stream === "SPORTS") return "SPORTS_PHYSICAL_ED";
  if (stream === "VOCATIONAL_SKILLED" || stream === "VOCATIONAL") return "VOCATIONAL_TRADES";
  return stream;
}

async function main() {
  console.log(`Seeding ${KAABIL_ASSESSMENTS.length} assessments into Neon PostgreSQL...`);

  for (const asm of KAABIL_ASSESSMENTS) {
    const stream = mapToEducationalStream(asm.stream);
    const assessment = await prisma.assessment.upsert({
      where: { slug: asm.slug },
      update: {
        title: asm.title,
        description: asm.description,
        stream,
        category: asm.category,
        targetSkillName: asm.targetSkillName,
        difficultyLevel: asm.difficultyLevel,
        durationMinutes: asm.durationMinutes,
        passingPercentage: asm.passingPercentage,
      },
      create: {
        id: asm.id,
        title: asm.title,
        slug: asm.slug,
        description: asm.description,
        stream,
        category: asm.category,
        targetSkillName: asm.targetSkillName,
        difficultyLevel: asm.difficultyLevel,
        durationMinutes: asm.durationMinutes,
        passingPercentage: asm.passingPercentage,
      },
    });

    for (const q of asm.questions) {
      const question = await prisma.assessmentQuestion.upsert({
        where: { id: q.id },
        update: {
          assessmentId: assessment.id,
          questionOrder: q.questionOrder,
          questionType: q.questionType,
          questionText: q.questionText,
          explanation: q.explanation,
          points: q.points,
        },
        create: {
          id: q.id,
          assessmentId: assessment.id,
          questionOrder: q.questionOrder,
          questionType: q.questionType,
          questionText: q.questionText,
          explanation: q.explanation,
          points: q.points,
        },
      });

      await prisma.questionOption.deleteMany({
        where: { questionId: question.id },
      });

      for (const opt of q.options) {
        await prisma.questionOption.create({
          data: {
            questionId: question.id,
            optionKey: opt.optionKey,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
          },
        });
      }
    }
  }

  const count = await prisma.assessment.count();
  console.log(`Successfully seeded! Total Assessments in DB: ${count}`);
}

main()
  .catch((e) => {
    console.error("Error seeding assessments:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
