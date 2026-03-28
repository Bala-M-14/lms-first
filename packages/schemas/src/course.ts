import { z } from "zod"

export const courseSchema = z.object({
  courseName: z.string().trim().min(5),
  description: z.string().trim().min(20),
  topics_covered: z.string().trim().min(5),
  thumbnail: z.string().url(),
  price: z.coerce.number().min(0),
})

export type Course = z.infer<typeof courseSchema>