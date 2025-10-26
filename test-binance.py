import requests
import time

# 测试币安测试网连接
def test_binance_connection():
    print("Testing Binance Spot Testnet Connection...")
    
    # 设置代理
    proxies = {
        'http': 'http://127.0.0.1:7890',
        'https': 'http://127.0.0.1:7890'
    }
    
    try:
        # 测试时间API
        response = requests.get('https://testnet.binance.vision/api/v3/time', proxies=proxies, timeout=10)
        if response.status_code == 200:
            server_time = response.json()['serverTime']
            print(f"Server Time: {time.ctime(server_time/1000)}")
        else:
            print(f"Time API Error: {response.status_code} - {response.text}")
            return
            
        # 测试交易对信息
        response = requests.get('https://testnet.binance.vision/api/v3/exchangeInfo', proxies=proxies, timeout=10)
        if response.status_code == 200:
            symbols = response.json()['symbols']
            print(f"Available trading pairs: {len(symbols)}")
            # 查找BTC/USDT交易对
            btcusdt = next((s for s in symbols if s['symbol'] == 'BTCUSDT'), None)
            if btcusdt:
                print("BTC/USDT trading pair found")
            else:
                print("BTC/USDT trading pair not found")
        else:
            print(f"Exchange Info API Error: {response.status_code} - {response.text}")
            
        print("Binance Spot Testnet Connection Test Completed!")
        
    except Exception as e:
        print(f"Binance Spot Testnet Connection Error: {str(e)}")
        print("请检查代理设置或网络连接")

if __name__ == "__main__":
    test_binance_connection()