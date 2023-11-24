const MongoFields = {
  id: "_id",
  userId: "userId",
  active: "active",
  createdAt: "createdAt",
  updatedAt: "updatedAt",

  applicantId: "applicantId",
  applicationStatus: ["sent", "cancelled", "confirmed", "rejected"],
  jobId: "jobId",

  roleName: "name",

  fullName: "fullName",
  userName: "userName",
  phone: "phone",
  email: "email",
  address: "address",

  gender: "gender",
  password: "password",
  role: "role",
  status: "status",

  name_file: "name_file",
  src: "src",
  doc: "_doc",
};

export { MongoFields };
