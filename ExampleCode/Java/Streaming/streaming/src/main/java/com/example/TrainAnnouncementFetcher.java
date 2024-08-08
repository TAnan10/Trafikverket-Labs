package com.example;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.Level;
import java.util.logging.Logger;

public class TrainAnnouncementFetcher {

    private static final String AUTHENTICATION_KEY = "d68896103a8141a186a79910d41ce683";  // Replace with your real key
    private static final String REQUEST_JSON = """
    <REQUEST>
        <LOGIN authenticationkey="%s" />
        <QUERY sseurl="true" objecttype="TrainAnnouncement" orderby="AdvertisedTimeAtLocation" schemaversion="1.3" limit="10">
            <FILTER>
                <AND>
                </AND>
            </FILTER>
        <INCLUDE>AdvertisedTrainIdent</INCLUDE>
        <INCLUDE>ActivityType</INCLUDE>
        <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
        <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
        <INCLUDE>LocationSignature</INCLUDE>
        <INCLUDE>TimeAtLocation</INCLUDE>
        <INCLUDE>ScheduledDepartureDateTime</INCLUDE>
        </QUERY>
    </REQUEST>
    """.formatted(AUTHENTICATION_KEY);

    private static final HttpClient httpClient = HttpClient.newHttpClient();
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final AtomicBoolean running = new AtomicBoolean(true);

    public static void main(String[] args) {
        Thread keyListenerThread = new Thread(() -> {
            try {
                while (running.get()) {
                    int key = System.in.read();
                    if (key == 'x' || key == 'X') {
                        running.set(false);
                    }
                }
            } catch (IOException e) {
                Logger.getLogger(TrainAnnouncementFetcher.class.getName()).log(Level.SEVERE, null, e);
            }
        });

        keyListenerThread.setDaemon(true);
        keyListenerThread.start();

        try {
            String sseUrl = fetchSseUrl().get();
            startSseStream(sseUrl).get();
        } catch (InterruptedException | ExecutionException ex) {
            Logger.getLogger(TrainAnnouncementFetcher.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    private static CompletableFuture<String> fetchSseUrl() {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.trafikinfo.trafikverket.se/v2/data.json"))
                .header("Content-Type", "application/xml")
                .POST(HttpRequest.BodyPublishers.ofString(REQUEST_JSON))
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(TrainAnnouncementFetcher::extractSseUrl);
    }

    private static String extractSseUrl(String responseBody) {
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            return jsonNode.get("RESPONSE").get("RESULT").get(0).get("INFO").get("SSEURL").asText();
        } catch (IOException ex) {
            throw new RuntimeException("Failed to parse SSE URL from response", ex);
        }
    }

    private static CompletableFuture<Void> startSseStream(String sseUrl) {
        return CompletableFuture.runAsync(() -> {
            try {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(sseUrl))
                        .GET()
                        .build();

                var lines = httpClient.send(request, HttpResponse.BodyHandlers.ofLines()).body();
                for (String line : (Iterable<String>) lines::iterator) {
                    if (!running.get()) {
                        System.out.println("Stopping the stream as 'x' was pressed.");
                        break;
                    }
                    if (line.startsWith("data:")) {
                        processEvent(line.substring(5).trim());
                    }
                }
            } catch (IOException | InterruptedException ex) {
                Logger.getLogger(TrainAnnouncementFetcher.class.getName()).log(Level.SEVERE, null, ex);
            }
        });
    }

    private static void processEvent(String event) {
        try {
            JsonNode responseJson = objectMapper.readTree(event);
            JsonNode announcements = responseJson.get("RESPONSE").get("RESULT").get(0).get("TrainAnnouncement");
            if (announcements.isArray()) {
                for (JsonNode announcement : announcements) {
                    System.out.println("Train ID: " + getPropertyString(announcement, "AdvertisedTrainIdent"));
                    System.out.println("Location: " + getPropertyString(announcement, "LocationSignature"));
                    System.out.println("Activity: " + getPropertyString(announcement, "ActivityType"));
                    System.out.println("Advertised Time: " + getPropertyString(announcement, "AdvertisedTimeAtLocation"));
                    System.out.println("Time at Location: " + getPropertyString(announcement, "TimeAtLocation"));
                    System.out.println("Scheduled Departure: " + getPropertyString(announcement, "ScheduledDepartureDateTime"));
                    System.out.println();
                }
            }
        } catch (IOException ex) {
            Logger.getLogger(TrainAnnouncementFetcher.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    private static String getPropertyString(JsonNode element, String propertyName) {
        return element.has(propertyName) ? element.get(propertyName).asText() : "N/A";
    }
}
