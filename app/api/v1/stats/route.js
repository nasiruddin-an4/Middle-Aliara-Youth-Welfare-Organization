import dbConnect from "@/lib/mongodb";
import Activity from "@/lib/models/Activity";
import Member from "@/lib/models/Member";
import Gallery from "@/lib/models/Gallery";
import Payment from "@/lib/models/Payment";
import Expense from "@/lib/models/Expense";
import { successResponse, errorResponse, handleOptions } from "@/lib/apiHelpers";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    await dbConnect();

    const currentYear = new Date().getFullYear();

    const [
      totalMembers,
      totalActivities,
      upcomingActivities,
      ongoingActivities,
      completedActivities,
      totalGalleryImages,
      totalPaymentsResult,
      totalExpensesResult,
      recentActivities,
      featuredGallery,
    ] = await Promise.all([
      Member.countDocuments({ isActive: true }),
      Activity.countDocuments({}),
      Activity.countDocuments({ status: "upcoming" }),
      Activity.countDocuments({ status: "ongoing" }),
      Activity.countDocuments({ status: "completed" }),
      Gallery.countDocuments({}),
      Payment.aggregate([
        { $match: { year: currentYear } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { year: currentYear } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Activity.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title category status date location featured media")
        .lean(),
      Gallery.find({ featured: true })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    const totalCollectedThisYear =
      totalPaymentsResult.length > 0 ? totalPaymentsResult[0].total : 0;
    const totalExpensesThisYear =
      totalExpensesResult.length > 0 ? totalExpensesResult[0].total : 0;

    return successResponse({
      members: {
        total: totalMembers,
      },
      activities: {
        total: totalActivities,
        upcoming: upcomingActivities,
        ongoing: ongoingActivities,
        completed: completedActivities,
      },
      gallery: {
        total: totalGalleryImages,
      },
      finance: {
        year: currentYear,
        totalCollected: totalCollectedThisYear,
        totalExpenses: totalExpensesThisYear,
        balance: totalCollectedThisYear - totalExpensesThisYear,
      },
      recentActivities,
      featuredGallery,
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
