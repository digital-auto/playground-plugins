
  
<div class="logo-container">
  <img src="./img/FSTI.png" alt="Logo 2" width="180"/>
  <img src="./img//AIoTLogoLabHN.jpg" alt="Logo 1" width="160"/>
</div>

# AIoT Hands-on Practice Guide 

In this guide, we use the [**Wallet Detection**](https://playground.digital.auto/model/67ae0607133b6f0028e0dc8c/library/prototype/67ae0646133b6f0028e0dd17/dashboard) demo case on [**digital.auto Playground**](https://playground.digital.auto/) as an example to illustrate the process of building an AIoT prototype powered by Cloud-AI services.  

The guide is structured into two key phases:  

1. **Building an Object Detection AI Model** – We will create an AI model from scratch using the [**Landing.ai**](https://landing.ai/) platform.  
2. **Deploying the Model and Prototying** – Once the model is trained, we will deploy it on [**digital.auto Playground**](https://playground.digital.auto/) and develop a simple prototype around it. This step will demonstrate how the model can be integrated into an AIoT application, showcasing its functionality in a real-world scenario. 

Through this hands-on approach, you will gain practical experience in developing and deploying AIoT applications seamlessly.

## 1. Building an Object Detection AI Model  

### 1.1 Register a Landing.ai Account and Create a New AI Project  
1. Sign up for an account on the [Landing.ai homepage](https://app.landing.ai/login).  
   <img src="./img/LandingaiRegistration2.png" alt="Landing.ai Registration" width="700">  

2. Once logged in, navigate to your personal dashboard and click on the **Create Project** tile to start a new project.  
   <img src="./img/LandingLens2.png" alt="LandingLens" width="700">  

3. Inside your newly created project, click the **Edit** icon and assign a descriptive name to your project.  
   <img src="./img/ProjectName2.png" alt="Project Name" width="700">  

### 1.2 Select Your Project Type  
  LandingLens supports three main computer vision tasks:  
  - **Object Detection**: Identifies objects by drawing bounding boxes around them.  
  - **Segmentation**: Identifies objects by painting pixels over them.  
  - **Classification**: Categorizes entire images into predefined groups.  

For the **Wallet Detection** project, select **Object Detection** as the project type.  

### 1.3 Upload Your Image Dataset  
1. If you have a pre-labeled image dataset, upload it by selecting the **Drop to Upload** button.  
     - Drag and drop your dataset onto the upload page.  
       <img src="./img/BrowseImages2.png" alt="Dataset Upload" width="700">  
     - Once uploaded, LandingLens will automatically annotate the images.  
       <img src="./img/DatasetUpload.png" alt="Dataset Upload" width="700">  

2. If you only have raw (unlabeled) images, you can manually annotate them using LandingLens’s built-in annotation tool.  
     - Upload your raw images as before, then click on an image to enter the annotation editor.  
        <img src="./img/AnnotationTool.png" alt="Annotation Tool" width="700">  
     - Click **+ Create Class** to define the object you want to detect (e.g., Wallet).  
        <img src="./img/DefineClass.png" alt="Define Class" width="700">  
     - Label your images by drawing a bounding box around the object and use the left/right arrow keys to navigate through images.  
        <img src="./img/DrawBox.png" alt="Draw Box" width="700">  
     - If an image does not contain any relevant objects, click **Nothing to Label** in the bottom right corner.  

### 1.4 Train Your Model Online  
1. Once your dataset is prepared, click the **Train** button to initiate model training. This process will take a few minutes.  

### 1.5 Generate Your Model API Key  
  1. Click **Deploy** in the left menu, then select **Create new endpoint** to deploy your model.  
  2. Assign a name and click **Create** to finalize the deployment.  
  3. Click **View API Key**, enter a name, and then click **Generate API Key** to obtain your personalized API key.  
  4. This API key will be required later when integrating your model with **digital.auto Playground**, allowing you to send image data via API calls.  
     <img src="./img/Api.png" alt="API Key Generation" width="700">  


## 2. Deploying the Model and Prototyping

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
  





