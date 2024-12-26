const z = require('zod');

const signupSchema = z.object({
    email: z.string().min(3).max(30).email(),
    password: z.string().min(6).max(20),
    firstName: z.string().max(50),
    lastName: z.string().max(50),
})
const loginSchema = z.object({
  email: z.string().email().min(3).max(30),
  password: z.string().min(6).max(20),
});

const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  imageUrl: z.string().url(),
  price: z.number().positive(),
});

const courseUpdateSchema = z.object({
  courseId:z.string().min(5),
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive().optional(),
});

const purchaseSchema = z.object({
  userId: z.string().optional(),
  courseId: z.string()
})

module.exports = {
    signupSchema,
    loginSchema,
    courseSchema,
    courseUpdateSchema,
    purchaseSchema,
}