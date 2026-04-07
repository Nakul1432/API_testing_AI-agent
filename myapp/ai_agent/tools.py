import requests
import json

def execute_api_call(method, url, body=None, header=None):
    try:
        method = method.upper()

        response = requests.request(
            method=method,
            url=url,
            json=body if body else None,
            headers=header if header else {},
            timeout=10
        )

       
        return {
            "status_code": response.status_code,
            "data": response.json() if response.content else None
        }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    result = execute_api_call("GET", "https://jsonplaceholder.typicode.com/posts/1")
    print(json.dumps(result, indent=4))