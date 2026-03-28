import { z } from "zod"

export const lessonSchema = z.object({
  title: z.string().trim().min(3),
  content: z.string().trim().min(10),
  order_index: z.number().int().min(0),
  course_id: z.string().uuid(),
})

export type Lesson = z.infer<typeof lessonSchema>