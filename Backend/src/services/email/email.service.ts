import nodemailer from "nodemailer";
import { env } from "../../config/env";
import orderRepository from "../../repositories/order.repository";
import { prisma } from "../../config/prisma";
import { formatMoneyVND } from "../../utils/format";

class EmailService {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  });

  sendOrderEmail = async (orderId: string, userId: string) => {
    const order = await orderRepository.findById(prisma, orderId, userId);
    if (!order) {
      throw new Error("Đơn hàng không tồn tại!");
    }

    await this.transporter.sendMail({
      to: order.user.email,
      subject: `Đơn hàng #${order.orderCode} đã được đặt thành công!`,
      html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Cảm ơn bạn đã đặt hàng!</h1>
      </div>

      <div style="padding: 30px;">
        <p style="font-size: 18px; font-weight: bold;">Xin chào ${order.user.username},</p>
        <p>Chúng tôi đã nhận được đơn hàng của bạn và đang chuẩn bị để giao cho đơn vị vận chuyển.</p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2563eb;">Thông tin đơn hàng #${order.orderCode}</h3>
          <p style="margin: 5px 0;"><strong>Trạng thái:</strong> <span style="color: #059669;">${order.status}</span></p>
          <p style="margin: 5px 0;"><strong>Ngày đặt:</strong> ${new Date().toLocaleDateString("vi-VN")}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #eee;">
              <th style="text-align: left; padding: 10px 0;">Sản phẩm</th>
              <th style="text-align: right; padding: 10px 0;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${
              order.subOrders.length > 0
                ? order.subOrders
                    .flatMap((subOrder) =>
                      subOrder.orderItems.map(
                        (item) => `
                      <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px 0;">${item.productName} x ${item.quantity}</td>
                        <td style="text-align: right; padding: 10px 0;">${formatMoneyVND(item.price.toNumber() * item.quantity)}</td>
                      </tr>
                    `,
                      ),
                    )
                    .join("")
                : ""
            }
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 20px 0; font-weight: bold; font-size: 18px;">Tổng cộng:</td>
              <td style="padding: 20px 0; font-weight: bold; font-size: 20px; color: #dc2626; text-align: right;">
                ${formatMoneyVND(order.originalTotalAmount.toNumber())} VND
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 5px 0;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ <a href="mailto:support@example.com" style="color: #2563eb;">hotro@cuahang.com</a></p>
        <p style="margin: 5px 0;">© 2024 Cửa hàng của chúng tôi. All rights reserved.</p>
      </div>
    </div>
  `,
    });
  };

  sendPaymentSuccessEmail = async (orderId: string, userId: string) => {
    const order = await orderRepository.findById(prisma, orderId, userId);
    if (!order) {
      throw new Error("Đơn hàng không tồn tại!");
    }

    await this.transporter.sendMail({
      to: order.user.email,
      subject: `Thanh toán thành công đơn hàng #${order.orderCode}`,
      html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #059669; padding: 30px; text-align: center;">
        <div style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; line-height: 60px; border-radius: 50%; margin: 0 auto 15px; color: white; font-size: 30px;">✓</div>
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Thanh toán thành công!</h1>
      </div>

      <div style="padding: 30px;">
        <p style="font-size: 18px; font-weight: bold;">Xin chào ${order.user.username},</p>
        <p>Tuyệt vời! Giao dịch của bạn đã được xác nhận thành công. Chúng tôi đang nhanh chóng hoàn tất các bước cuối cùng để giao hàng cho bạn.</p>
        
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">Chi tiết giao dịch</h3>
          <table style="width: 100%; font-size: 14px; border-spacing: 0 8px;">
            <tr>
              <td style="color: #64748b;">Mã đơn hàng:</td>
              <td style="text-align: right; font-weight: bold;">#${order.orderCode}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Số tiền đã thanh toán:</td>
              <td style="text-align: right; font-weight: bold; color: #dc2626; font-size: 18px;">
                ${formatMoneyVND(order.originalTotalAmount.toNumber())}
              </td>
            </tr>
            <tr>
              <td style="color: #64748b;">Trạng thái:</td>
              <td style="text-align: right;"><span style="background-color: #059669; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">Đã thanh toán</span></td>
            </tr>
            <tr>
              <td style="color: #64748b;">Thời gian:</td>
              <td style="text-align: right;">${new Date().toLocaleString("vi-VN")}</td>
            </tr>
          </table>
        </div>
      </div>

      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 5px 0;">Cảm ơn bạn đã tin tưởng mua sắm tại cửa hàng!</p>
        <p style="margin: 5px 0;">Hotline: 1900 xxxx | Email: <a href="mailto:support@example.com" style="color: #059669;">hotro@cuahang.com</a></p>
        <p style="margin: 10px 0 0;">© 2024 Cửa hàng của chúng tôi. All rights reserved.</p>
      </div>
    </div>
  `,
    });
  };
}

export default new EmailService();
