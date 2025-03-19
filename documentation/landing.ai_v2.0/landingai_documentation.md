
  
<div class="logo-container">
  <img src="./img/FSTI.png" alt="Logo 2" width="180"/>
  <img src="./img//AIoTLogoLabHN.jpg" alt="Logo 1" width="160"/>
</div>

# Landing AI Platform Model build up and digital.auto Playground Deployment Guide

Here we take [**Wallet Detection**](https://playground.digital.auto/model/67ae0607133b6f0028e0dc8c/library/prototype/67ae0646133b6f0028e0dd17/dashboard) demo case on [**digital.auto Playground**](https://playground.digital.auto/), as an example, to demonstrate how to create an AI-related Software-defined Vehicle prototype. The process is divided into two main parts, building an object detection AI model on the [**Landing.ai**](https://landing.ai/) platform  from scratch and deploying this model on digital.auto Playground. 

## 1. Landing.ai AI model build up

### 1.1 Register a Landing.ai account and create an AI project
* Register an account at Landing AI homepage (https://app.landing.ai/login).
  <img src="./img/LandingaiRegistration2.png" alt="LandingaiRegistration" width="700">

* After entering your personal account home page, click on **Create Project** tile to create your project.
  <img src="./img//LandingLens2.png" alt="LandingLens" width="700">

* After entering your created project, click on **Edit** icon  and enter a descriptive name for your project.
  <img src="./img/ProjectName2.png" alt="ProjectName" width="700">

### 1.2 Select your project type
* Three main Computer Vision related tasks that can be developed on LandingLens: 
  * Object Detection: I want to identify objects by drawing boxes around them.
  * Segmentation: I want to identify objects by painting pixels on them.
  * Classification: I want to identify each image into different categories.
* For **Wallet Detection** project, we select the project type of Object detection.

### 1.3 Upload your image dataset 
* If you have labeled image datasets, you can upload them by selecting drop to upload button. 
  * Drag the image dataset to LandingLens on the upload image page.
    <img src="./img/BrowseImages2.png" alt="DatasetUpload" width="700">
  * After uploading your dataset to LandingLens, the images will be automatically annotated.
    <img src="./img/DatasetUpload.png" alt="DatasetUpload" width="700">
* If you only have some raw images without labeling, you can utilize LandingLens online annotation tool to label your images. 
  * Update your raw images to LandingLens as before, then click one image to enter the annotation editor.
    <img src="./img/AnnotationTool.png" alt="AnnotationTool" width="700">
  * Click on **+ Create Class** to define the item you want to detect into a class, e.g., Wallet.   
     <img src="./img/DefineClass.png" alt="DefineClass" width="700">
  *  You can label your images by drawing a box on the object that you want to identify, then press the left or right arrow keys on your keyboard accordingly to move to the next image.
     <img src="./img/DrawBox.png" alt="DrawBox" width="700">

  * If the image does not have any items to label, then click **Nothing to Label** on the bottom right corner.

### 1.4 Train your model online
  * After you prepare your dataset on LandingLens, click the **Train** button to start training your customized wallet detection model, which will take a few minutes.
  
### 1.5 Generate your model API key
* Click on **Deploy** button in the left menu, then click on **Create new endpoint** and deploy. Give a name and click **Create** button to create your endpoint.
* Select **View API Key**, enter the name, and click **Generate API Key** to generate your personalized API key. Later during the deployment of digital.auto Playground, you will use API calls to send images by specifying your API key. 
  <img src="./img/Api.png" alt="DatasetUpload" width="700">

## 2. digital.auto Playground integration

In this section, the integration processes of the AI model from LandingLens on digital.auto Playground will be introduced. We will deploy two widgets (one for the raw image and one for the AI inference results) on the vehicle model Dashboard on Playground to demonstrate Wallet Detection use case. 

### 2.1 Login to the digital.auto playground portal
* Click this link https://playground.digital.auto/ to visit digital.auto playground portal on your web browser.
* Login with your user email ID and password. (Please send an email to chris.cheng@ferdinand-steinbeis-institut.de to request an account)

### 2.2 Choose your vehicle model
* Click on **Vehicle Models** button; thus, all public vehicle models are visible.
  <img src="./img/SelectVehicleModel2.jpg" alt="SelectVehicleModel" width="700">

* Click on the vehicle model **Industrial Internet**.
   
  <img src="./img/IndustrialInternet2.jpg" alt="IndustrialInternet" width="700">

### 2.3 Create your prototype template
* Click **Prototype Library** to enter the prototype catalog.
  <img src="./img/PrototypeLibrary2.jpg" alt="PrototypeLibrary" width="700">

* Click on **+ Create New Prototype** button to create your prototype under **Industrial Internet** vehicle model.
  <img src="./img/NewPrototype2.jpg" alt="NewPrototype" width="700">

* Provide your prototype name and your programming language, then click **New Prototype** button to create your prototype.
  
  <img src="./img/PrototypeDescription2.jpg" alt="PrototypeDescription" width="300">

### 2.4 Implement Widgets and Build your Dashboard
* Click on the **Dashboard** sub-tab within your prototype to see a blank canvas. Click on the **Edit** button.
    <img src="./img/Dashboard.jpg" alt="Dashboard" width="700">

* Select the blocks in which you want to place the first widget and click on the **Add widget** button as shown below.
    <img src="./img/AddWidget.jpg" alt="AddWidget" width="700">

* A list of widgets from the marketplace is displayed. Select the Simple Landing AI widget and click on Add selected widget.
    <img src="./img/AddLandingaiWidget.jpg" alt="AddLandingaiWidget" width="700">

* Go back to the **Deploy** menu on Landing.ai and copy the details like endpoint and API key(generated earlier). 
* Click on Edit Widget and add the copied details from above and click **Save**.
    <img src="./img/AddEndpointAPIKey.jpg" alt="AddEndpointAPIKey" width="700">
    <img src="./img/LandingaiWidget.jpg" alt="LandingaiWidget" width="700">

* After clicking on **Save**, you should see your first widget on the dashboard as shown below.
    <img src="./img/LandingaiDashboard.jpg" alt="LandingaiDashoboard" width="700">

* Next, create and add the other widget blocks needed, as shown below. Ensure to set their attribute values appropriately.

  **Simple Alert Sound Widget:** 
    This widget can be used in scenarios to notify or alert the customer of any event. In this case, if a wallet is detected, the sound alert buzzer notifies the user that their wallet is found. This widget/animation listens to one VSS signal. The default value is "0". When the VSS value is "1", it will trigger the alert.
     <img src="./img/AlertSoundWidget.jpg" alt="AlertSoundWidget" width="700">
     <img src="./img/AlertWidgetVSSAPI.jpg" alt="AlertWidgetVSSAPI" width="700">
  
  **Map Widget:**
    This widget showcases the current location and the direction in which the vehicle has traveled on Google Maps. VSS APIs are used to fetch the current latitude and longitude to configure the present location on the map.
     <img src="./img/MapWidget.jpg" alt="MapWidget" width="700">
     <img src="./img/MapWidgetVSSAPI.jpg" alt="MapWidgetVSSAPI" width="700">

  **Signal List Settable widget:**
    This widget is used to read and set the values of the VSS signals being used in the scenario. It listens to a list of VSS signals you want to monitor. This widget displays the current values of VSS signals in the list and an option to set the values.
      <img src="./img/SignalListWidget.jpg" alt="SignalListWidget" width="700">
      <img src="./img/SignalListWidget2.jpg" alt="SignalListWidget2" width="700">
      <img src="./img/SignalListWidget3.jpg" alt="SignalListWidget3" width="700">


### 2.5 Implement your prototype using Python script
* Click on the **SDV Code** sub-tab within your prototype to enter the page for the Software-defined vehicle Python script editor and write your code.
   <img src="./img/PythonScript.jpg" alt="PythonScript" width="700">

### 2.6 Final view of your prototype on Dashboard.
* Finally, the widgets for uploading your local image and presenting AI model inference will be populated on your prototype dashboard.
  
  <img src="./img/FinalDashboard1.jpg" alt="FinalDashboard1" width="700">

* Upload your image with **Upload** button, then click on **Submit** button; AI model inference from LandingLens will pop up on the right side after a few seconds.
  





