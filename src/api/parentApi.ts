import axios from "axios";

// Create parent profile / link student to parent by student id
export async function createParentProfile(payload: { studentId: number }) {
  const res = await axios.post("/api/parent-profiles", payload);
  return res.data;
}
