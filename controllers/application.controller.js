import asyncHandler from "express-async-handler";
import { ApplicationModel } from "../globals/mongodb.js";

// Get all  applications
const getAll = asyncHandler(async (req, res) => {
  const currentPage = parseInt(req.query.currentPage) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const offset = (currentPage - 1) * pageSize;

  try {
    //Lấy dữ liệu từ mongodb
    const appications = await ApplicationModel.find()
      .limit(pageSize)
      .skip(offset);

    // Tính tổng số lượng applications
    const totalCounts = await ApplicationModel.countDocuments();

    // Tính số trang
    const totalPages = Math.ceil(totalCounts / pageSize);

    // Xác định liệu còn dữ liệu trong trang kế tiếp hay không
    const hasNext = currentPage < totalPages;
    
    // if(currentPage > totalPages) {
    //   res.status(400).json({ error: "Requested page does not exist" });
    // }

    res.status(200).json({
      data: appications,
      hasnext: hasNext,
      currentPage,
      pageSize,
      totalCounts,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error querying the database" });
  }
});

const ApplicationController = {
  getAll,
};

export default ApplicationController;
