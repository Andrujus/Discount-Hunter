#!/usr/bin/env python
import httpx
import json
import time

print("=" * 60)
print("TESTING COMPLETE OCR → SCRAPE → RESULTS FLOW")
print("=" * 60)

# Test scrape endpoint
print("\n[1] Starting scrape job for 'MAGGI SAUCY NOODLES'...")
response = httpx.post(
    'http://127.0.0.1:3000/api/scrape',
    json={'query': 'MAGGI SAUCY NOODLES'}
)
print(f"Response Status: {response.status_code}")
scrape_data = response.json()
print(f"Response: {scrape_data}")

if response.status_code == 200:
    job_id = scrape_data['jobId']
    print(f"\n✓ Job created: {job_id}")
    
    # Poll for results
    print("\n[2] Polling for scrape results...")
    for poll_num in range(10):
        time.sleep(2)
        status_response = httpx.get(f'http://127.0.0.1:3000/api/scrape/{job_id}')
        data = status_response.json()
        status = data['status']
        print(f"   Poll {poll_num}: Status = {status}")
        
        if status == 'completed':
            print("\n✓ Scraping completed!")
            print("\n[3] Store Results:")
            print("-" * 60)
            if data.get('data'):
                for store in data['data']:
                    print(f"  {store['store']}:")
                    if store['price']:
                        print(f"    Price: {store['currency']}{store['price']}")
                    else:
                        print(f"    Price: Not found")
                    print(f"    URL: {store['productUrl']}")
                    print()
            else:
                print("  No store data returned")
            break
        elif status == 'failed':
            print(f"\n✗ Job failed: {data.get('error')}")
            break
