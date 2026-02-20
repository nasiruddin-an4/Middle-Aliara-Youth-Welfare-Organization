import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email,
    pass: process.env.Email_pass,
  },
});

export const sendReceiptEmail = async (member, payment) => {
  if (!member.social?.email) return;

  const mailOptions = {
    from: `"মধ্য আলীয়ারা যুব কল্যাণ সংগঠন" <${process.env.Email}>`,
    to: member.social.email,
    subject: "পেমেন্ট নিশ্চিতকরণ - মধ্য আলীয়ারা যুব কল্যাণ সংগঠন",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
          <h2 style="color: #059669; margin: 0;">মধ্য আলীয়ারা যুব কল্যাণ সংগঠন</h2>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">কচুয়া, চাঁদপুর</p>
        </div>
        
        <div style="padding: 20px 0; text-align: center;">
          <h3 style="color: #1f2937; margin: 0 0 10px;">পেমেন্ট সফল হয়েছে!</h3>
          <p style="color: #6b7280; font-size: 16px; margin: 0;">আপনার পেমেন্ট আমাদের কাছে পৌঁছেছে। ধন্যবাদ।</p>
          
          <div style="margin: 30px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px dashed #059669; max-width: 400px;">
            <p style="font-size: 12px; color: #9ca3af; text-transform: uppercase; margin: 0 0 5px;">পেমেন্ট বিবরণ</p>
            <h1 style="color: #059669; font-size: 36px; margin: 0 0 20px;">৳${payment.amount}</h1>
            
            <div style="text-align: left;">
              <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>সদস্য নাম:</strong> ${member.name}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>সদস্য আইডি:</strong> ${member.memberId || member.id}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>মাস/বছর:</strong> ${getMonthName(payment.month)}, ${payment.year}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>মাধ্যম:</strong> ${payment.source}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>তারিখ:</strong> ${payment.date ? new Date(payment.date).toLocaleDateString("bn-BD") : new Date().toLocaleDateString("bn-BD")}</p>
              ${payment.transactionId ? `<p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>ট্রানজেকশন আইডি:</strong> ${payment.transactionId}</p>` : ""}
            </div>
          </div>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #9ca3af; font-size: 12px;">
          <p>এটি একটি স্বয়ংক্রিয় ইমেইল। দয়া করে উত্তর দেবেন না।</p>
          <p>&copy; ${new Date().getFullYear()} মধ্য আলীয়ারা যুব কল্যাণ সংগঠন</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${member.social.email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const sendJoinRequestStatusEmail = async (
  request,
  status,
  customMessage = "",
) => {
  if (!request.email) return;

  if (!process.env.Email || !process.env.Email_pass) {
    console.warn(
      "Email credentials (Email, Email_pass) are missing in .env file",
    );
    // Don't throw for now to avoid crashing if only email fails, but log it
    // Or throw if you want to notify the frontend
    throw new Error("Server email configuration is missing.");
  }

  const isApproved = status === "approved";
  const statusText = isApproved ? "অনুমোদিত" : "বাতিল";
  const statusColor = isApproved ? "#059669" : "#dc2626";
  const statusIcon = isApproved ? "✅" : "❌";

  // Use custom message if provided, otherwise use default
  const mainMessage =
    customMessage ||
    (isApproved
      ? "অভিনন্দন! আপনার সদস্যপদ আবেদন অনুমোদিত হয়েছে। আমাদের পরিবারে আপনাকে স্বাগতম।"
      : "দুঃখিত, আপনার সদস্যপদ আবেদনটি এই মুহূর্তে গৃহীত হয়নি। অনুগ্রহ করে পরবর্তীতে আবার চেষ্টা করুন।");

  const mailOptions = {
    from: `"মধ্য আলীয়ারা যুব কল্যাণ সংগঠন" <${process.env.Email}>`,
    to: request.email,
    subject: `সদস্যপদ আবেদন ${statusText} - মধ্য আলীয়ারা যুব কল্যাণ সংগঠন`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
          <h2 style="color: #059669; margin: 0;">মধ্য আলীয়ারা যুব কল্যাণ সংগঠন</h2>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">কচুয়া, চাঁদপুর</p>
        </div>
        
        <div style="padding: 20px 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">${statusIcon}</div>
          <h3 style="color: #1f2937; margin: 0 0 10px;">সদস্যপদ আবেদন ${statusText}</h3>
          
          <div style="color: #4b5563; font-size: 16px; margin: 0; white-space: pre-wrap; line-height: 1.5;">
            ${mainMessage}
          </div>
          
          <div style="margin: 30px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px dashed ${statusColor}; max-width: 400px;">
            <p style="font-size: 12px; color: #9ca3af; text-transform: uppercase; margin: 0 0 5px;">আবেদনের তথ্য</p>
            <div style="display: inline-block; padding: 8px 20px; border-radius: 50px; background-color: ${isApproved ? "#ecfdf5" : "#fef2f2"}; color: ${statusColor}; font-weight: bold; font-size: 18px; margin: 10px 0 20px;">
              ${statusText}
            </div>
            
            <div style="text-align: left;">
              <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>নাম:</strong> ${request.fullName}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>ফোন:</strong> ${request.phone}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>ঠিকানা:</strong> ${request.address}</p>
              ${request.profession ? `<p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>পেশা:</strong> ${request.profession}</p>` : ""}
              ${request.bloodGroup ? `<p style="margin: 5px 0; font-size: 14px; color: #4b5563;"><strong>রক্তের গ্রুপ:</strong> ${request.bloodGroup}</p>` : ""}
            </div>
          </div>

          ${
            isApproved
              ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #059669;">
            <p style="margin: 0; font-size: 14px; color: #065f46; text-align: left;">
              <strong>পরবর্তী পদক্ষেপ:</strong><br/>
              অনুগ্রহ করে সংগঠনের প্রশাসকের সাথে যোগাযোগ করুন এবং আপনার সদস্যপদ সম্পন্ন করুন।
            </p>
          </div>
          `
              : ""
          }
        </div>

        <div style="text-align: center; padding: 20px 0;">
          <a href="https://www.facebook.com/profile.php?id=61588173091476" style="background-color: #1877F2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-block;">
            আমাদের ফেসবুক পেজ ভিজিট করুন
          </a>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #9ca3af; font-size: 12px;">
          <p>এটি একটি স্বয়ংক্রিয় ইমেইল। দয়া করে উত্তর দেবেন না।</p>
          <p>&copy; ${new Date().getFullYear()} মধ্য আলীয়ারা যুব কল্যাণ সংগঠন</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Join request status email sent to ${request.email}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending join request status email:", error);
    throw error;
  }
};

const getMonthName = (monthIndex) => {
  const months = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];
  return months[monthIndex - 1] || "";
};
