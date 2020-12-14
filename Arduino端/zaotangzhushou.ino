#include "ESP8266.h"
#include "dht11.h"
#include "SoftwareSerial.h"
#include<tm1650.h>

#define ON  DISPLAY_ON
#define OFF DISPLAY_OFF
#define SegmentMode   _8_SEGMENT_MODE

//配置ESP8266WIFI设置
#define SSID "888"    //填写2.4GHz的WIFI名称，不要使用校园网
#define PASSWORD "12345689"//填写自己的WIFI密码
#define HOST_NAME "api.heclouds.com"  //API主机名称，连接到OneNET平台，无需修改
#define DEVICE_ID "642700567"       //填写自己的OneNet设备ID
#define HOST_PORT (80)                //API端口，连接到OneNET平台，无需修改
String APIKey = "b10fFxWJHzK0GXVqC5ExtXBbfeI="; //与设备绑定的APIKey

#define INTERVAL_SENSOR 5000 //定义传感器采样及发送时间间隔

unsigned char  LightLevel = LV1;              
unsigned char  WorkMode = NORMAL_MODE;

//define each segment
const unsigned char  Seg_test[8]= {0x20,0x01,0x02,0x04,0x08,0x10,0x40,0x80};  
//number 0-9 code       
const unsigned char Number_arr[10]= {0x3f,0x06,0x5b,0x4f,0x66,0x6d,0x7d,0x07,0x7f,0x6f};  

unsigned char i=0,m=0;
unsigned char temp[4]={0x3f,0x06,0x5b,0x4f};
boolean err = 0;
unsigned char key_value=0;
unsigned char show_buff[4];

int  pin_SCK = 13;
int pin_DIO = 12;

TM1650 tm1650(pin_SCK,pin_DIO);

//创建dht11示例

dht11 DHT11;

//定义DHT11接入Arduino的管脚
#define DHT11PIN 4

//定义ESP8266所连接的软串口
/*********************
 * 该实验需要使用软串口
 * Arduino上的软串口RX定义为D3,
 * 接ESP8266上的TX口,
 * Arduino上的软串口TX定义为D2,
 * 接ESP8266上的RX口.
 * D3和D2可以自定义,
 * 但接ESP8266时必须恰好相反
 *********************/
SoftwareSerial mySerial(3, 2);
ESP8266 wifi(mySerial);

void setup()
{
  mySerial.begin(115200); //初始化软串口
  Serial.begin(9600);     //初始化串口
  Serial.print("setup begin\r\n");

  //以下为ESP8266初始化的代码
  Serial.print("FW Version: ");
  Serial.println(wifi.getVersion().c_str());

  if (wifi.setOprToStation()) {
    Serial.print("to station ok\r\n");
  } else {
    Serial.print("to station err\r\n");
  }

  //ESP8266接入WIFI
  if (wifi.joinAP(SSID, PASSWORD)) {
    Serial.print("Join AP success\r\n");
    Serial.print("IP: ");
    Serial.println(wifi.getLocalIP().c_str());
  } else {
    Serial.print("Join AP failure\r\n");
  }

  Serial.println("");
  Serial.print("DHT11 LIBRARY VERSION: ");
  Serial.println(DHT11LIB_VERSION);

  mySerial.println("AT+UART_CUR=9600,8,1,0,0");
  mySerial.begin(9600);
  Serial.println("setup end\r\n");
}

unsigned long net_time1 = millis(); //数据上传服务器时间
int ti=0;

void loop(){

  //配置显示模块参数
  err = tm1650.DisplayConfig_TM1650(LightLevel,SegmentMode,WorkMode,ON);

  for(i = 0;i < 4; i++)
  {
    err = tm1650.DisplayOneDigi_TM1650(i+1,0xFF);
  }
    for(i = 0;i < 4; i++)
  {
    err = tm1650.DisplayOneDigi_TM1650(i+1,0);
  }

    key_value = tm1650.Scan_Key_TM1650();  //获取按键值，左键值为34，右键值为47
    
 

    //通过按键进行澡堂人流计数，左键（34）加一，右键（47）减一
    if(key_value==34 and m<9){
      m++;
      show_buff[3]=m;}
    else if(key_value==34 and m>=9){ //设置TM1650显示数上限为9（澡堂隔间总数为9）
      m = 9;
      show_buff[3]=m;
      }
    else if(key_value==47 and m>0){
      m--;
      show_buff[3]=m;}
    else if(key_value==47 and m<=0){ //设置TM1650显示数下限为0
      m = 0;
      show_buff[3]=m;
      }
    else{ }
    for(i = 0;i < 9; i++)
    {
      err = tm1650. DisplayOneDigi_TM1650(i+1,Number_arr[show_buff[i]]);
    }
    
    float sensor_tem = (float)DHT11.temperature;
 ti++;
 delay(500);
 
 if(ti>20){
  ti=0;
  if (net_time1 > millis())
    net_time1 = millis();

  if (millis() - net_time1 > INTERVAL_SENSOR) //发送数据时间间隔
  {

    int chk = DHT11.read(DHT11PIN);

    Serial.print("Read sensor: ");
    switch (chk) {
      case DHTLIB_OK:
        Serial.println("OK");
        break;
      case DHTLIB_ERROR_CHECKSUM:
        Serial.println("Checksum error");
        break;
      case DHTLIB_ERROR_TIMEOUT:
        Serial.println("Time out error");
        break;
      default:
        Serial.println("Unknown error");
        break;
    }
    
    Serial.print("Temperature (oC): ");
    Serial.println(sensor_tem, 2);
    Serial.println("");

    Serial.println(Number_arr[show_buff[i]]);
    Serial.println("");   

    if (wifi.createTCP(HOST_NAME, HOST_PORT)) { //建立TCP连接，如果失败，不能发送该数据
      Serial.print("create tcp ok\r\n");
      char buf[10];
      //拼接发送data字段字符串


      String jsonToSend = "{\"Temperature\":";
      dtostrf(sensor_tem, 1, 2, buf);
      jsonToSend += "\"" + String(buf) + "\"";
      jsonToSend += ",\"number\":";
      dtostrf(m, 1, 2, buf);
      jsonToSend += "\"" + String(buf) + "\"";
      jsonToSend += "}";

      //拼接POST请求字符串
      String postString = "POST /devices/";
      postString += DEVICE_ID;
      postString += "/datapoints?type=3 HTTP/1.1";
      postString += "\r\n";
      postString += "api-key:";
      postString += APIKey;
      postString += "\r\n";
      postString += "Host:api.heclouds.com\r\n";
      postString += "Connection:close\r\n";
      postString += "Content-Length:";
      postString += jsonToSend.length();
      postString += "\r\n";
      postString += "\r\n";
      postString += jsonToSend;
      postString += "\r\n";
      postString += "\r\n";
      postString += "\r\n";

      const char *postArray = postString.c_str(); //将str转化为char数组

      Serial.println(postArray);
      wifi.send((const uint8_t *)postArray, strlen(postArray)); //send发送命令，参数必须是这两种格式，尤其是(const uint8_t*)
      Serial.println("send success");
      if (wifi.releaseTCP()) { //释放TCP连接
        Serial.print("release tcp ok\r\n");
      } else {
        Serial.print("release tcp err\r\n");
      }
      postArray = NULL; //清空数组，等待下次传输数据
    } else {
      Serial.print("create tcp err\r\n");
    }

    Serial.println("");

    net_time1 = millis();
  }
 }
}
