
function include(filePath, fileType) {
    const scriptTag = document.createElement("script");
    scriptTag.src = filePath;
    scriptTag.type = fileType;
    document.body.appendChild(scriptTag);
}

const plugin = ({widgets, simulator, prototype}) => {

    let arryRowData = []; 
    let counter = 0 
    var data = prototype.customer_journey
    let size = prototype.customer_journey ? Object.keys(data[0]).length : 0
    if(counter === 0) {
    for(let i=0; i<size;i++) {
        
        arryRowData.push({
            dt: "",
            cld: "",
            b1: "",
            sdv:"",
            b2: "",
            veh: "",
            vt: ""
        })
    }
counter++}

function GetTable (keys,arrayRowData) {

  let rv = keys.map(function (key, index) {
        var color1 = ["#ffffff", "#003a6f", "#005072", "#276577", "#396c6e", "#5c855f", "#598234", "#8da44a",   "#aebd38", "#006f4d"];
        if (key !== "") {
          let container1 = document.createElement("div")
          container1.innerHTML =
          `
          <div style=  "background-color: ${color1[index]}; padding: 0; color:#ffffff; ">
            <div className="grid " style="display: grid; grid-template-columns: auto auto auto">
                  <img src= "https://ngisvtrkzzxmikxlhgdt.supabase.co/storage/v1/object/public/playground.plugins/arrow-right-circle-fill-white.svg" style="height:30px; width: 50px; color: #ffffff; text-align:left;">
                  <div style="text-align: center; grid-column: 2 / span 2; font-weight:bold;">
                  ${key}
                  </div>
                </div>
          </div>
          
          <table style= "width: 100% ; ">
              <tr>
              <td> ${arrayRowData[index -1].dt}</td>
              <td> ${arrayRowData[index -1].cld}</td>
              <td> ${arrayRowData[index -1].b1}</td>
              <td> ${arrayRowData[index -1].sdv}</td>
              <td> ${arrayRowData[index -1].b2}</td>
              <td> ${arrayRowData[index -1].veh}</td>
              <td> ${arrayRowData[index -1].vt}</td>
          </tr>
                      
        </table>
          `
            return ( container1 );
        }
    }
   )
 return rv;
};
let finalContainer = null;
var CJAnalysis = function () {
    

    var keys = Object.keys(data).length === 0 ? [] : Object.keys(data[0]);
    let fillerHTML = GetTable(keys, arryRowData);
      finalContainer = document.createElement("div")
      fillerHTML.forEach((element, index) => {
        if(element !== undefined && index === 1) {
          finalContainer = element
         
        }
        else if(element !== undefined) {
          let child1 = element.children[0];
          let child2 = element.children[1];
          finalContainer.appendChild(child1)
          finalContainer.appendChild(child2)
        }
        
      })
      console.log(finalContainer);
    let analysis = `
    <style>
    .gridContainer {
        display: grid;
        grid-template-columns: auto auto auto auto auto auto auto;
        gap: 5px;
        padding: 5px;
    }
    div {
        text-align: center;
        padding: 10px 0;
        font-size: 20px;
    }
    .header1 {
        grid-column: 1 / 8;
        background-color: #d9d9d9;
        font-weight:bold;
        border-radius: 15px 15px 0px 0px;
      }
    
    .header21 {
        grid-column: 1 / 3;
        background-color: #d9d9d9;
        font-weight:bold;
      }
    
    .header22 {
        grid-column: 3/ 8;
        background-color: #d9d9d9;
        font-weight:bold;
      }
    
      .tableHeader {
        font-weight:bolder;
        text-align: center;
        width: 240px;
        word-wrap: break-word;
      }
    
      .gridContainer table, th, td {
        text-align: center;
      }
    
      .tableStepHeader {
        grid-column: 1/ 8;
        padding: 0;
    
      }
    
      .tableStepHeader.circle{
        background-color: #fff;
    
    
      }
      .tableStepHeader table{
        table-layout: fixed;
      }
    
      .tableStepHeader table tr td:nth-child(odd) {
        background:#f2f2f2;
      }
      
      .tableStepHeader table tr td:nth-child(even) {
        background:#c8e3fb;
      }
    
      .tableStepHeader table tr td {
        height: 100px;
        font-size: 18px;
        word-wrap: break-word;
      }
    </style>
    <div class = "gridContainer">
        <div class = "header1" >Systems-of-systems</div>
        <div class = "header21" >Off-Board</div>
        <div class = "header22">On-Board</div>
        <div class = "tableHeader">Digital Touchpoints </div>
        <div class = "tableHeader "> Cloud/ Backend</div> 
        <div class = "tableHeader "> 
           <img src= "https://ngisvtrkzzxmikxlhgdt.supabase.co/storage/v1/object/public/playground.plugins/triangles.svg" style="height:30px; width: 50px; margin: auto; object-fit: contain;">
        </div> 
        <div class = "tableHeader ">SdV</div> 
        <div class = "tableHeader">
        <img src= "https://ngisvtrkzzxmikxlhgdt.supabase.co/storage/v1/object/public/playground.plugins/triangles.svg" style="height:30px; width: 50px; margin: auto; object-fit: contain;">
        </div> 
        <div class = "tableHeader" >E/E Vehicle </div> 
        <div class = "tableHeader" >Vehicle Touchpoints</div>
        <div class = "tableStepHeader">
        </div>  
        
  </div>
  `
    
    return keys.length === 0 ? null : (analysis);
}

 let global_box = null
	widgets.register("CJAnalysis", (box) => {
        global_box = box
        let container = document.createElement("div")
        container.innerHTML = CJAnalysis()        
        let test = container.querySelector(".tableStepHeader")
        test.innerHTML = finalContainer.innerHTML
        box.injectNode(container)

    }


    ) 
    return {
        set_text_CA: (colHead, stepNo, bodyData) => {
            arryRowData[stepNo][colHead] = bodyData;
            let container = document.createElement("div")
          container.innerHTML = CJAnalysis()        
          let test = container.querySelector(".tableStepHeader")
          test.innerHTML = finalContainer.innerHTML

        global_box.injectNode(container)
        }
    }
}

export default plugin
