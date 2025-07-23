import request from "supertest";
import app from "../index.js"; // you might need to export your app from server.js

describe("Vehicle Routes", () => {
  it("GET /api/vehicles should return 200", async () => {
    const res = await request(app).get("/api/vehicles");
    expect(res.statusCode).toBe(200);
  });

  it("POST /api/vehicles should fail without auth", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .send({ case_number: "123" }); // send dummy body
    expect(res.statusCode).toBe(401);
  });
});
