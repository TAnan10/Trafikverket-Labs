package ExampleCode.Java.BasicRequest;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.io.StringWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

public class BasicRequest {

    public static void main(String[] args) {
        System.out.println("--- Download Data Sample ---");

        Scanner scanner = new Scanner(System.in);
        final HttpURLConnection[] connection = {null};

        Thread inputThread = new Thread(() -> {
            while (true) {
                String input = scanner.nextLine();
                if (input.equalsIgnoreCase("C")) {
                    if (connection[0] != null) {
                        connection[0].disconnect();
                        System.out.println("Request cancelled by user.");
                    }
                } else if (input.equalsIgnoreCase("X")) {
                    System.out.println("Exiting...");
                    System.exit(0);
                }
            }
        });

        inputThread.setDaemon(true);
        inputThread.start();

        try {
            // API server URL
            URL url = new URL("https://api.trafikinfo.trafikverket.se/v2/data.xml");

            connection[0] = (HttpURLConnection) url.openConnection();
            connection[0].setRequestMethod("POST");
            connection[0].setRequestProperty("Referer", "http://www.example.com"); // Replace with your domain here
            connection[0].setRequestProperty("Content-Type", "text/xml");
            connection[0].setDoOutput(true);

            String requestBody = "<REQUEST>" +
                    "<LOGIN authenticationkey='02a306c35ef0407ba3e61c8acfa215e3'/>" +
                    "<QUERY objecttype='TrainAnnouncement' schemaversion='1.9' limit='10'>" +
                    "<FILTER></FILTER>" +
                    "</QUERY>" +
                    "</REQUEST>";

            connection[0].getOutputStream().write(requestBody.getBytes());

            System.out.println("Fetching data... (press 'C' to cancel)");

            int responseCode = connection[0].getResponseCode();
            System.out.println("Response Code: " + responseCode);
            if (responseCode == 200) {
                BufferedReader in = new BufferedReader(new InputStreamReader(connection[0].getInputStream()));
                String inputLine;
                StringBuilder response = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();

                System.out.println("Raw XML Response:");
                System.out.println(response.toString());

                System.out.println(formatXml(response.toString()));
                System.out.println("Data downloaded successfully.");
            } else {
                System.out.println("Request failed: " + responseCode);
            }
        } catch (Exception ex) {
            System.out.println("An error occurred: " + ex.getMessage());
        } finally {
            if (connection[0] != null) {
                connection[0].disconnect();
            }
            System.out.println("Press 'X' to exit.");
        }

        scanner.close();
    }

    // Format XML so it is readable by humans.
    private static String formatXml(String xml) {
        try {
            DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();
            Document document = documentBuilder.parse(new InputSource(new StringReader(xml)));

            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "4");

            StringWriter stringWriter = new StringWriter();
            transformer.transform(new DOMSource(document), new StreamResult(stringWriter));
            return stringWriter.toString();
        } catch (Exception ex) {
            return "Error formatting XML: " + ex.getMessage();
        }
    }
}
