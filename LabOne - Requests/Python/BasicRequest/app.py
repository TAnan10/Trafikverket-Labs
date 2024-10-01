import requests
import xml.etree.ElementTree as ET
import xml.dom.minidom as minidom

def fetch_data():
    url = "https://api.trafikinfo.trafikverket.se/v2/data.xml"
    headers = {
        "Referer": "http://www.example.com",  # Replace with your domain here
        "Content-Type": "text/xml"
    }
    request_body = '''<REQUEST>
                          <LOGIN authenticationkey="02a306c35ef0407ba3e61c8acfa215e3"/>
                          <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="10">
                              <FILTER></FILTER>
                          </QUERY>
                      </REQUEST>'''
    
    print("Fetching data ...")
    response = requests.post(url, headers=headers, data=request_body)
    response.raise_for_status()  # Ensure we notice bad responses
    return response.text

def format_xml(xml_str):
    xml = ET.fromstring(xml_str)
    pretty_xml_as_str = minidom.parseString(ET.tostring(xml)).toprettyxml(indent="      ", newl="\n")
    return "\n".join([line for line in pretty_xml_as_str.split('\n') if line.strip()])

def main():
    print("--- Download data sample ---")
    
    try:
        response = fetch_data()
        print(format_xml(response))
        print("Data downloaded.")
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except Exception as ex:
        print(f"An error occurred: {ex}")

if __name__ == "__main__":
    main()