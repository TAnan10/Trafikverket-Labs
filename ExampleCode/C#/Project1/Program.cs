using System;
using System.Net;
using System.Text;
using System.Xml;
using System.Xml.Linq;

namespace OpenAPISampleNET
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("--- Download Data Sample ---");

            using (var webClient = new WebClient())
            {
                webClient.Headers.Add("Referer", "http://www.example.com"); // Replace with your domain here
                webClient.Headers["Content-Type"] = "text/xml";

                webClient.UploadStringCompleted += WebClient_UploadStringCompleted;

                try
                {
                    // API server URL
                    var address = new Uri("https://api.trafikinfo.trafikverket.se/v2/data.xml");
                    var requestBody = @"<REQUEST>
                                            <LOGIN authenticationkey='02a306c35ef0407ba3e61c8acfa215e3'/>
                                            <QUERY objecttype='TrainAnnouncement' schemaversion='1.9' limit='10'>
                                                <FILTER></FILTER>
                                            </QUERY>
                                        </REQUEST>";

                    Console.WriteLine("Fetching data... (press 'C' to cancel)");
                    webClient.UploadStringAsync(address, "POST", requestBody);
                }
                catch (UriFormatException)
                {
                    Console.WriteLine("Malformed URL. Press 'X' to exit.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"An error occurred: {ex.Message}. Press 'X' to exit.");
                }

                char keyChar;
                do
                {
                    keyChar = char.ToUpper(Console.ReadKey().KeyChar);
                    if (keyChar == 'C')
                    {
                        webClient.CancelAsync();
                    }
                } while (keyChar != 'X');
            }
        }

        private static void WebClient_UploadStringCompleted(object sender, UploadStringCompletedEventArgs e)
        {
            if (e.Cancelled)
            {
                Console.WriteLine("Request cancelled by user.");
            }
            else if (e.Error != null)
            {
                Console.WriteLine($"Request failed: {e.Error.Message}");
            }
            else
            {
                Console.WriteLine(FormatXml(e.Result));
                Console.WriteLine("Data downloaded successfully.");
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
