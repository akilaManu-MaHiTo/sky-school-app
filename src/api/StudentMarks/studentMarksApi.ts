import axios from "axios";
import { z } from "zod";

export async function fetchStudentMarks(
  gradeId: number,
  classId: number,
  year: string,
  medium: string,
  subjectId: number,
  term: string
) {
  const res = await axios.get(
    `/api/student-profiles/${gradeId}/${classId}/${year}/${medium}/${subjectId}/${term}marks`
  );
  return res.data;
}
