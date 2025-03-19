
  
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
  Landing.ai supports three main computer vision tasks:  
  - **Object Detection**: Identifies objects by drawing bounding boxes around them.  
  - **Segmentation**: Identifies objects by painting pixels over them.  
  - **Classification**: Categorizes entire images into predefined groups.  

For the **Wallet Detection** project, select **Object Detection** as the project type.  

### 1.3 Upload Your Image Dataset  
1. If you have a pre-labeled image dataset, upload it by selecting the **Drop to Upload** button.  
     - Drag and drop your dataset onto the upload page.  
       <img src="./img/BrowseImages2.png" alt="Dataset Upload" width="700">  
     - Once uploaded, Landing.ai will automatically annotate the images.  
       <img src="./img/DatasetUpload.png" alt="Dataset Upload" width="700">  

2. If you only have raw (unlabeled) images, you can manually annotate them using Landing.ai's built-in annotation tool.  
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

In this section, we will guide you through the process of integrating your AI model from **Landing.ai** into **digital.auto Playground**. We will deploy multiple widgets—including a Landing.aI inference results display, an alert sound widget, a map widget, and a signal list widget—onto the canvas in the Playground to demonstrate the **Wallet Detection** use case.  


### 2.1 Log in to digital.auto Playground  
1. Open [**digital.auto Playground**](https://playground.digital.auto/) in your web browser.  
2. Log in using your email ID and password. *(To request an account, please contact chris.cheng@ferdinand-steinbeis-institut.de.)*  

### 2.2 Select Your Vehicle Model  
1. Click the **Vehicle Models** button to view available public models.  
   <img src="./img/SelectVehicleModel2.jpg" alt="Select Vehicle Model" width="700">  
2. Select the **Industrial Internet** vehicle model.  
   <img src="./img/IndustrialInternet2.jpg" alt="Industrial Internet" width="700">  

### 2.3 Create Your Prototype Template  
1. Navigate to **Prototype Library** to access the prototype catalog.  
   <img src="./img/PrototypeLibrary2.jpg" alt="Prototype Library" width="700">  
2. Click **+ Create New Prototype** to create a prototype under the **Industrial Internet** vehicle model.  
   <img src="./img/NewPrototype2.jpg" alt="New Prototype" width="700">  
3. Provide a name for your prototype, select your preferred programming language, and click **New Prototype** to proceed.  
   <img src="./img/PrototypeDescription2.jpg" alt="Prototype Description" width="300">  

### 2.4 Implement Widgets and Build Your Dashboard  
1. Click the **Dashboard** sub-tab within your prototype to access a blank canvas, then click **Edit**.  
   <img src="./img/Dashboard.jpg" alt="Dashboard" width="700">  
2. Select the grid blocks where you want to place your first widget and click **Add Widget**.  
   <img src="./img/AddWidget.jpg" alt="Add Widget" width="700">  
3. From the available widget marketplace, select **Simple Landing AI Widget** and click **Add Selected Widget**.  
   <img src="./img/AddLandingaiWidget.jpg" alt="Add Landing AI Widget" width="700">  
4. Retrieve your **Endpoint** and **API Key** from the **Deploy** menu in Landing.ai.  
5. Click **Edit Widget**, enter the copied details, and click **Save**.  
   <img src="./img/AddEndpointAPIKey.jpg" alt="Add Endpoint API Key" width="700">  
   <img src="./img/LandingaiWidget.jpg" alt="Landing AI Widget" width="700">  
6. Once saved, your first widget will appear on the dashboard.  
   <img src="./img/LandingaiDashboard.jpg" alt="Landing AI Dashboard" width="700">  

### 2.5 Add Additional Widgets  
To enhance your prototype, add the following widgets and configure them accordingly:  

#### **Simple Alert Sound Widget**  
- This widget generates an audio alert when a wallet is detected.  
- It listens to a VSS signal that triggers the alert when the value changes from "0" to "1".  
   <img src="./img/AlertSoundWidget.jpg" alt="Alert Sound Widget" width="700">  
   <img src="./img/AlertWidgetVSSAPI.jpg" alt="Alert Widget VSS API" width="700">  

#### **Map Widget**  
- Displays the vehicle’s current location and movement direction using Google Maps.  
- Uses VSS APIs to fetch real-time latitude and longitude coordinates.  
   <img src="./img/MapWidget.jpg" alt="Map Widget" width="700">  
   <img src="./img/MapWidgetVSSAPI.jpg" alt="Map Widget VSS API" width="700">  

#### **Signal List Settable Widget**  
- Monitors and updates VSS signal values in real-time.  
- Provides an interface to set and modify VSS signal values directly.  
   <img src="./img/SignalListWidget.jpg" alt="Signal List Widget" width="700">  
   <img src="./img/SignalListWidget2.jpg" alt="Signal List Widget 2" width="700">  
   <img src="./img/SignalListWidget3.jpg" alt="Signal List Widget 3" width="700">  

By following these steps, you will successfully integrate your AI model into **digital.auto Playground** and build an interactive prototype demonstrating **Wallet Detection** in an AIoT environment.  

### 2.6 Implement Your Prototype Using a Python Script  
1. Navigate to the **SDV Code** sub-tab within your prototype to access the Application Python script editor.  
2. Write and implement your Python code to define the behavior of your prototype.  
   <img src="./img/PythonScript.jpg" alt="Python Script" width="700">  

### 2.7 Finalizing and Viewing Your Prototype on the Dashboard  
- Once all widgets are configured, your prototype dashboard will be ready for demostraction.  
  <img src="./img/FinalDashboard1.jpg" alt="Final Dashboard" width="700">  

- To test your setup:  
  1. Click the **Upload** button to upload a local image.  
  2. Click **Submit** to send the image to the AI model.  
  3. After a few seconds, the AI inference result from **Landing.ai** will be displayed on the right side of the dashboard.  

With this, your first AI-powered prototype is successfully deployed and ready for use in **digital.auto Playground**! 🚀  
