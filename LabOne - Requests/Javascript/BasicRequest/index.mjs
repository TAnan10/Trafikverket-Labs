import fetch from 'node-fetch';
import { parseStringPromise, Builder } from 'xml2js';

async function fetchData() {
    const url = "https://api.trafikinfo.trafikverket.se/v2/data.xml";
    const headers = {
        "Referer": "http://www.example.com",  // Replace with your domain here
        "Content-Type": "text/xml"
    };
    const requestBody = `<REQUEST>
                            <LOGIN authenticationkey="02a306c35ef0407ba3e61c8acfa215e3"/>
                            <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="10">
                                <FILTER></FILTER>
                            </QUERY>
                         </REQUEST>`;

    console.log("Fetching data ...");
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: requestBody
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        console.log("Response received:");
        return text;
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
}

async function formatXML(xmlStr) {
    try {
        const parsedObj = await parseStringPromise(xmlStr, { explicitArray: false });
        const builder = new Builder({ renderOpts: { pretty: true, indent: '      ', newline: '\n' } });
        return builder.buildObject(parsedObj);
    } catch (error) {
        console.error(`An error occurred during XML parsing: ${error.message}`);
    }
}

async function main() {
    console.log("--- Download data sample ---");

    try {
        const response = await fetchData();
        if (response) {
            const formattedXML = await formatXML(response);
            console.log(formattedXML);
        }
        console.log("Data downloaded.");
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
}

main();
