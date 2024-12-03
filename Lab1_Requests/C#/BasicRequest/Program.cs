using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;

namespace OpenAPISampleNET
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("--- Download Data Sample ---");

            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Add("Referer", "http://www.example.com"); // Replace with your domain here

                try
                {
                    string API_KEY = LoadAPI_KEY();
                    if (string.IsNullOrEmpty(API_KEY))
                    {
                        Console.WriteLine("API key not found. Please ensure secrets.json is configured correctly.");
                        return;
                    }
                    // API server URL
                    var address = new Uri("https://api.trafikinfo.trafikverket.se/v2/data.xml");
                    var requestBody = @"<REQUEST>
                                            <LOGIN authenticationkey='{API_KEY}'/>
                                            <QUERY objecttype='TrainAnnouncement' schemaversion='1.9' limit='10'>
                                                <FILTER></FILTER>
                                            </QUERY>
                                        </REQUEST>";

                    Console.WriteLine("Fetching data... (press 'C' to cancel)");

                    var cts = new System.Threading.CancellationTokenSource();
                    var uploadTask = UploadStringAsync(httpClient, address, requestBody, cts.Token);

                    char keyChar;
                    do
                    {
                        keyChar = char.ToUpper(Console.ReadKey().KeyChar);
                        if (keyChar == 'C')
                        {
                            cts.Cancel();
                        }
                    } while (keyChar != 'X');

                    await uploadTask;
                }
                catch (UriFormatException)
                {
                    Console.WriteLine("Malformed URL. Press 'X' to exit.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"An error occurred: {ex.Message}. Press 'X' to exit.");
                }
            }
        }

        private static string LoadAPI_KEY()
        {
            try
            {
                string filePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "secrets.json");
                if (File.Exists(filePath))
                {
                    string jsonContent = File.ReadAllText(filePath);
                    var jsonDocument = JsonDocument.Parse(jsonContent);
                    if (jsonDocument.RootElement.TryGetProperty("API_KEY", out var apiKeyProperty))
                    {
                        return apiKeyProperty.GetString();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading secrets.json: {ex.Message}");
            }
            return null;
        }

        private static async Task UploadStringAsync(HttpClient httpClient, Uri address, string requestBody, System.Threading.CancellationToken cancellationToken)
        {
            try
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "text/xml");
                var response = await httpClient.PostAsync(address, content, cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    Console.WriteLine(FormatXml(result));
                    Console.WriteLine("Data downloaded successfully.");
                }
                else
                {
                    Console.WriteLine($"Request failed: {response.ReasonPhrase}");
                }
            }
            catch (OperationCanceledException)
            {
                Console.WriteLine("Request cancelled by user.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Request failed: {ex.Message}");
            }

            Console.WriteLine("Press 'X' to exit.");
        }

        // Format XML so it is readable by humans.
        private static string FormatXml(string xml)
        {
            var formattedXml = new StringBuilder();

            using (var xmlReader = XmlReader.Create(new System.IO.StringReader(xml)))
            {
                var xmlWriterSettings = new XmlWriterSettings
                {
                    OmitXmlDeclaration = true,
                    Indent = true,
                    IndentChars = "    "
                };

                using (var xmlWriter = XmlWriter.Create(formattedXml, xmlWriterSettings))
                {
                    while (xmlReader.Read())
                    {
                        switch (xmlReader.NodeType)
                        {
                            case XmlNodeType.Element:
                                xmlWriter.WriteStartElement(xmlReader.Prefix, xmlReader.LocalName, xmlReader.NamespaceURI);
                                xmlWriter.WriteAttributes(xmlReader, true);
                                break;
                            case XmlNodeType.Text:
                                xmlWriter.WriteString(xmlReader.Value);
                                break;
                            case XmlNodeType.CDATA:
                                xmlWriter.WriteCData(xmlReader.Value);
                                break;
                            case XmlNodeType.EntityReference:
                                xmlWriter.WriteEntityRef(xmlReader.Name);
                                break;
                            case XmlNodeType.ProcessingInstruction:
                                xmlWriter.WriteProcessingInstruction(xmlReader.Name, xmlReader.Value);
                                break;
                            case XmlNodeType.Comment:
                                xmlWriter.WriteComment(xmlReader.Value);
                                break;
                            case XmlNodeType.DocumentType:
                                xmlWriter.WriteDocType(xmlReader.Name, xmlReader.GetAttribute("PUBLIC"), xmlReader.GetAttribute("SYSTEM"), xmlReader.Value);
                                break;
                            case XmlNodeType.Whitespace:
                            case XmlNodeType.SignificantWhitespace:
                                xmlWriter.WriteWhitespace(xmlReader.Value);
                                break;
                            case XmlNodeType.EndElement:
                                xmlWriter.WriteFullEndElement();
                                break;
                        }
                    }
                }
            }

            return formattedXml.ToString();
        }
    }
}
