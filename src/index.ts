import express, { type Request, type Response } from 'express';

// import middleware
import morgan from "morgan";

// import database
import { students } from './db/db.js';
import { type Student, type Course } from "./libs/types.js";
import {
  zStudentDeleteBody,
  zStudentPostBody,
  zStudentPutBody,
} from "./libs/studentValidator.js";

const app = express();
const port = process.env.PORT || 3000;

// use middleware
app.use(morgan("dev", { immediate: false }));
app.use(express.json());    // parses request's payload into 'req.body'

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("API services for Student Data");
});

// GET /students
// get students (by program)
app.get("/students", (req: Request, res: Response) => {
  try {
    const program = req.query.program;

    if (program) {
      const filtered_students = students.filter(
        (student) => student.program === program
      );
      return res.json({
        success: true,
        data: filtered_students,
      });
    } else {
      return res.json({
        success: true,
        count: students.length,
        data: students,
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

/////////////////////////////////////////////////////////
//  localhost:3000/api/students?studentId=650610001&program=CPE
//  localhost:3000/api/students?studentId&program=CPE
//  localhost:3000/api/students?program=CPE
//  localhost:3000/api/students
//test GET/api/students
app.get('/api/students' , (req:Request,res:Response)=>{
  try{
    const studentId = req.query.studentId;
    const program = req.query.program;

    if(studentId && program){
      const filt_std = students.filter(
        (s)=> s.studentId === studentId && s.program === program);

        return res.json({
          ok:true,
          students: filt_std
        })
      } else if(studentId){
          const filt_ID = students.filter(
            (s)=> s.studentId === studentId);

          return res.json({
            ok:true,
            students: filt_ID
        })
      } else if(program){
          const fil_prog = students.filter(
            (p)=> p.program === program);

          return res.json({
            ok:true,
            students: fil_prog
          })
      } else {
          return res.json({
            ok: true,
            students: students
          });
      }

  } catch(err) {
      return res.status(500).json({
        success:false,
        message: "Error not found",
        error:err
      })
    }
});




// POST /students, body = {new student data}
// add a new student
app.post("/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPostBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const found = students.find(
      (student) => student.studentId === body.studentId
    );
    if (found) {
      return res.json({
        success: false,
        message: "Student is already exists",
      });
    }

    // add new student
    const new_student = body;
    students.push(new_student);

    // add response header 'Link'
    res.set("Link", `/students/${new_student.studentId}`);

    return res.json({
      success: true,
      data: new_student,
    });
    // return res.json({ ok: true, message: "successfully" });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// PUT /students, body = {studentId}
// Update specified student
app.put("/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPutBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId
    );

    if (foundIndex === -1) {
      return res.json({
        success: false,
        message: "Student does not exists",
      });
    }

    // update student data
    students[foundIndex] = { ...students[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/students/${body.studentId}`);

    return res.json({
      success: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// DELETE /students, body = {studentId}
app.delete("/api/students", (req: Request, res: Response) => {

  try{
    const delStudent = req.body;
    const result = zStudentDeleteBody.safeParse(delStudent);

  if(!result.success){
    return res.status(400).json({
      ok:false,
      message:`StudentID must contain 9 characters nakub!`
    })
  }

  const stdId = result.data.studentId;

  const foundLoc = students.findIndex(
    (std) => std.studentId === stdId
  );

  if(foundLoc === -1){
    return res.status(404).json({
      ok:false,
      message: "StudentId does not exist"
    })
  }

  students.splice(foundLoc,1);
  return res.json({
    ok:true,
    message: `studentId ${stdId} has been deleted`
  })

  }catch(err){
    return res.status(500).json({
      ok:false,
      message: "Something is wrong, please try again.",
      error:err
    })
  }

});

// GET /api/me
app.get('/api/me',(req:Request,res:Response)=>{
  try{
    return res.json({
    ok:true,
    fullName:"Methas Naisoo",
    studentId: "680610708"
  })
  } catch(err){
    return res.status(404).json({
      ok:false,
      message: "Not found data",
      error: err,
    })
  }

})

app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;