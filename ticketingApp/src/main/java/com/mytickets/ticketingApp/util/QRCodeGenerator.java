package com.mytickets.ticketingApp.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class QRCodeGenerator {

    private static final Logger logger = LoggerFactory.getLogger(QRCodeGenerator.class);

    private QRCodeGenerator() {
        // Private constructor to prevent instantiation
    }

    public static String generateQRCodeBase64(String content, int width, int height) {
        try {
            BufferedImage qrCodeImage = generateQRCodeImage(content, width, height);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrCodeImage, "png", baos);
            byte[] imageBytes = baos.toByteArray();
            return Base64.getEncoder().encodeToString(imageBytes);
        } catch (IOException | WriterException e) {
            logger.error("Error generating QR code: {}", e.getMessage());
            throw new RuntimeException("Error generating QR code", e);
        }
    }

    public static BufferedImage generateQRCodeImage(String content, int width, int height) throws WriterException {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.MARGIN, 2);

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height, hints);
        return MatrixToImageWriter.toBufferedImage(bitMatrix);
    }

    public static byte[] generateQRCodeBytes(String content, int width, int height) {
        try {
            BufferedImage qrCodeImage = generateQRCodeImage(content, width, height);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrCodeImage, "png", baos);
            return baos.toByteArray();
        } catch (IOException | WriterException e) {
            logger.error("Error generating QR code: {}", e.getMessage());
            throw new RuntimeException("Error generating QR code", e);
        }
    }
}