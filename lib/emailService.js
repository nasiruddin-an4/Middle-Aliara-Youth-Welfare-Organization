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
