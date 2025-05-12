// src/main/java/com/mytickets/ticketingApp/service/impl/QRCodeServiceImpl.java
package com.mytickets.ticketingApp.service.impl;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.NotFoundException;
import com.google.zxing.Result;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeWriter;
import com.mytickets.ticketingApp.service.QRCodeService;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

import javax.imageio.ImageIO;

@Service
public class QRCodeServiceImpl implements QRCodeService {

    public String generateQRCodeAsBase64(String content, int width, int height) {
        try {
            // Use smaller dimensions to reduce the size of the base64 output
            int smallerWidth = 100;  // Reduced from the likely 250 or higher
            int smallerHeight = 100;

            BufferedImage qrCodeImage = generateQRCodeImage(content, smallerWidth, smallerHeight);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrCodeImage, "png", baos);
            byte[] imageBytes = baos.toByteArray();

            return Base64.getEncoder().encodeToString(imageBytes);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error generating QR code: " + e.getMessage());
            throw new RuntimeException("Error generating QR code", e);
        }
    }

    @Override
    public BufferedImage generateQRCodeImage(String content, int width, int height) throws WriterException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height);

        return MatrixToImageWriter.toBufferedImage(bitMatrix);
    }

    @Override
    public String readQRCode(BufferedImage image) {
        try {
            BinaryBitmap binaryBitmap = new BinaryBitmap(
                    new HybridBinarizer(new BufferedImageLuminanceSource(image))
            );
            Result result = new MultiFormatReader().decode(binaryBitmap);

            return result.getText();
        } catch (NotFoundException e) {
            throw new RuntimeException("QR Code not found in the image", e);
        }
    }

    @Override
    public byte[] generateQRCodeBytes(String content, int width, int height) {
        try {
            BufferedImage image = generateQRCodeImage(content, width, height);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);

            return baos.toByteArray();
        } catch (IOException | WriterException e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }
}