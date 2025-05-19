package com.api.API32025.AI;

import org.json.JSONObject;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ChatBot {
    private static final String PYTHON_API = "http://127.0.0.1:5001/api/chat";
    private static final String A_API = getGeminiEndpoint();

    public static String getGeminiEndpoint() {
        try {
            java.io.FileInputStream fis = new java.io.FileInputStream("D:/A_Api_Toke/AIkey/config.properties");
            java.util.Properties prop = new java.util.Properties();
            prop.load(fis);
            return prop.getProperty("FULL_URL");
        } catch (Exception e) {
            System.out.println("Không đọc được endpoint Gemini: " + e.getMessage());
            return "";
        }
    }

    // Gọi API Python
    public static String askPythonAPI(String message) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            JSONObject bodyJson = new JSONObject();
            bodyJson.put("message", message);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(PYTHON_API))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(bodyJson.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            JSONObject respJson = new JSONObject(response.body());

            if (respJson.has("reply")) {
                String reply = respJson.getString("reply");
                // Nếu Python trả lời "Xin lỗi..." nghĩa là không hiểu
                if (reply.toLowerCase().contains("xin lỗi") || reply.toLowerCase().contains("không hiểu")) {
                    return null;
                }
                return reply;
            }
        } catch (Exception e) {
            System.out.println("Lỗi gọi Python API: " + e.getMessage());
        }
        return null;
    }

    // Gọi API (AI)
    public static String askGeminiAI(String userInput) {
        try {
            HttpClient client = HttpClient.newHttpClient();

            JSONObject part = new JSONObject().put("text", userInput);
            org.json.JSONArray parts = new org.json.JSONArray().put(part);
            JSONObject contentItem = new JSONObject().put("parts", parts);
            org.json.JSONArray contents = new org.json.JSONArray().put(contentItem);
            JSONObject body = new JSONObject().put("contents", contents);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(A_API))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            JSONObject responseJson = new JSONObject(response.body());

            if (!responseJson.has("candidates")) {
                System.out.println("AI API response error: " + response.body());
                return "Đã xảy ra lỗi hoặc key bị giới hạn.";
            }

            return responseJson
                    .getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text");
        } catch (Exception e) {
            System.out.println("Lỗi gọi Gemini API: " + e.getMessage());
            return "Lỗi kết nối đến AI.";
        }
    }

    public static void main(String[] args) {
        System.out.println("========================== CHAT BOT ===============================");
        java.util.Scanner scanner = new java.util.Scanner(System.in);

        while (true) {
            System.out.print("\nYou: ");
            String input = scanner.nextLine();

            String reply = askPythonAPI(input);
            if (reply == null) {
                reply = askGeminiAI(input);
            }

            System.out.println("Bot: " + reply);
        }
    }
}
