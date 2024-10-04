using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace TrafikverketApiExample
{
    class Program
    {
        private static readonly HttpClient client = new HttpClient();
        private static readonly TimeSpan updateInterval = TimeSpan.FromSeconds(5);

        static async Task Main(string[] args)
        {
            string authenticationKey = "d68896103a8141a186a79910d41ce683"; // Ersätt med din riktiga nyckel
            string requestXml = $@"
                <REQUEST>
                    <LOGIN authenticationkey=""{authenticationKey}"" />
                    <QUERY sseurl=""true"" objecttype=""TrainAnnouncement"" orderby=""AdvertisedTimeAtLocation"" schemaversion=""1.3"" limit = ""10"">
                        <FILTER>
                        </FILTER>
                        <INCLUDE>AdvertisedTrainIdent</INCLUDE>
                        <INCLUDE>ActivityType</INCLUDE>
                        <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
                        <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
                        <INCLUDE>LocationSignature</INCLUDE>
                        <INCLUDE>TimeAtLocation</INCLUDE>
                        <INCLUDE>ScheduledDepartureDateTime</INCLUDE>
                    </QUERY>
                </REQUEST>";

            var content = new StringContent(requestXml, Encoding.UTF8, "application/xml");
            HttpResponseMessage response = await client.PostAsync("https://api.trafikinfo.trafikverket.se/v2/data.json", content);
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();

            // Deserialisera JSON-svaret för att få SSE-URL
            var jsonDoc = JsonDocument.Parse(responseBody);
            var sseUrl = jsonDoc.RootElement
                .GetProperty("RESPONSE")
                .GetProperty("RESULT")[0]
                .GetProperty("INFO")
                .GetProperty("SSEURL")
                .GetString();

            Console.WriteLine($"SSE URL: {sseUrl}");

            // Starta SSE-strömmen
            await StartSseStream(sseUrl);
        }

        private static async Task StartSseStream(string sseUrl)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, sseUrl);
            using (var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead))
            {
                response.EnsureSuccessStatusCode();
                using (var stream = await response.Content.ReadAsStreamAsync())
                using (var reader = new StreamReader(stream))
                {
                    string line;
                    List<string> eventBuffer = new List<string>();
                    DateTime lastUpdate = DateTime.MinValue;

                    while ((line = await reader.ReadLineAsync()) != null)
                    {
                        if (!string.IsNullOrWhiteSpace(line))
                        {
                            eventBuffer.Add(line);
                        }

                        if (DateTime.Now - lastUpdate >= updateInterval)
                        {
                            if (eventBuffer.Count > 0)
                            {
                                ProcessEvents(eventBuffer);
                                eventBuffer.Clear();
                                lastUpdate = DateTime.Now;
                            }
                        }
                    }
                }
            }
        }

        private static void ProcessEvents(List<string> events)
        {
            Console.Clear();
            Console.WriteLine("Nya händelser:");

            foreach (var eventData in events)
            {
                if (eventData.StartsWith("data:"))
                {
                    string jsonData = eventData.Substring(5).Trim();
                    try
                    {
                        var jsonDoc = JsonDocument.Parse(jsonData);
                        var announcements = jsonDoc.RootElement
                            .GetProperty("RESPONSE")
                            .GetProperty("RESULT")[0]
                            .GetProperty("TrainAnnouncement");

                        foreach (var announcement in announcements.EnumerateArray())
                        {
                            Console.WriteLine("Tåg ID: " + GetPropertyString(announcement, "AdvertisedTrainIdent"));
                            Console.WriteLine("Plats: " + GetPropertyString(announcement, "LocationSignature"));
                            Console.WriteLine("Aktivitet: " + GetPropertyString(announcement, "ActivityType"));
                            Console.WriteLine("Annonserad Tid: " + GetPropertyDateTime(announcement, "AdvertisedTimeAtLocation"));
                            Console.WriteLine("Tid vid Plats: " + GetPropertyDateTime(announcement, "TimeAtLocation"));
                            Console.WriteLine("Schemalagd Avgång: " + GetPropertyDateTime(announcement, "ScheduledDepartureDateTime"));
                            Console.WriteLine();
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Fel vid bearbetning av händelse: {ex.Message}");
                    }
                }
            }
        }

        private static string? GetPropertyString(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var property) ? property.GetString() : "N/A";
        }

        private static string GetPropertyDateTime(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var property) ? property.GetDateTime().ToString("yyyy-MM-dd HH:mm:ss") : "N/A";
        }
    }
}
