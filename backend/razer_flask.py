from flask import Flask
from flask import jsonify
from flask import request
from pprint import pprint
from secrets import USERNAME, PASSWORD
import requests
import xmltodict
from flask_cors import CORS, cross_origin
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


key_file = "./key_82d074e4-eb36-4de4-a9b4-b53e70974816.pem"
cert_file = "./cert.pem"

FX_URI = "https://sandbox.api.visa.com/forexrates/v1/foreignexchangerates?Accept=application/json"
CARD_INQUIRY_URI = "https://sandbox.api.visa.com/vctc/customerrules/v1/consumertransactioncontrols/walletservices/accountinquiry?Accept=application/json"


@app.errorhandler(Exception)
def handle_invalid_usage(error):
    return str(error)

@app.route('/getCurrentSpending')
@cross_origin()
def get_current_spending():
    inquiry_body = {
        "primaryAccountNumbers": ["4344978515350000"]
    }

    response = requests.post(
        CARD_INQUIRY_URI,
        cert=(cert_file, key_file), 
        json=inquiry_body,
        auth=(USERNAME, PASSWORD)
    )

    if response.status_code != 200:
        raise Exception('Invalid usage: %s' % response.status_code)

    response_json = response.json()
    spend_limit = response_json['resource']['accountInquiryResponse'][0]['controlDocuments'][0]['globalControls'][0]['spendLimit']
    current_spending = spend_limit['currentPeriodSpend']
    alert_threshold = spend_limit['alertThreshold']

    return jsonify(
        currentSpending=current_spending,
        alertThreshold=alert_threshold
    )


@app.route('/getCurrentFx')
@cross_origin()
def get_current_fx():
    dest_currency = request.args.get('dest_currency')
    source_currency = request.args.get('source_currency')
    amount = request.args.get('amount')
    markup_rate = request.args.get('markup_rate')

    body = {
        "destinationCurrencyCode": str(dest_currency),
        "markUpRate": str(markup_rate),
        "sourceAmount": str(amount),
        "sourceCurrencyCode": str(source_currency),
    }

    response = requests.post(
        FX_URI, 
        cert=(cert_file, key_file), 
        json=body,
        auth=(USERNAME, PASSWORD)
    )

    if response.status_code != 200:
        raise Exception('Invalid usage: %s' % response.status_code)

    response_text = response.text
    response_json = xmltodict.parse(response_text)['ns2:FxV2V2Response']

    return jsonify(
        conversionRate=response_json['conversionRate'],
        destinationAmount=response_json['destinationAmount'],
        markUpRateApplied=response_json['markUpRateApplied'],
        ooriginalDestnAmtBeforeMarkUp=response_json['originalDestnAmtBeforeMarkUp']
    )


if __name__ == "__main__":
    app.run(debug=True)