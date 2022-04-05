const equals = (valueOne, valueTwo) => valueOne === valueTwo;

const manageBody = (type) => {
    document.getElementById("body").style.opacity = equals(type, "HIDE") ? 0:1;
}

// check if form values are accurate
const getFormValues = () => {
    const cmpId = document.getElementById("campaign-id").value;
    const cmpControlGroup = document.getElementById("control-group-k").value;
    const cmpTypeOffer = document.getElementById("types-of-offers-k").value;
    const cmpName = document.getElementById("campaign-name").value;
    const cmpCommunictionType = document.getElementById("communication-type-k").value;
    const cmpProductType = document.getElementById("types-of-products-k").value;
    const cmpGroupCmp = document.getElementById("group-campaign-k").value;
  
    const notEmptyOrUndefined = (value) => {
      return value !== "" && value !== undefined && value !== null
    }
  
    const isValid = notEmptyOrUndefined(cmpId) && notEmptyOrUndefined(cmpControlGroup) && notEmptyOrUndefined(cmpTypeOffer) && notEmptyOrUndefined(cmpName) && notEmptyOrUndefined(cmpCommunictionType) && notEmptyOrUndefined(cmpProductType) && notEmptyOrUndefined(cmpGroupCmp);
  
    return {
      isValid, payload: { cmpId, cmpControlGroup, cmpTypeOffer, cmpName, cmpCommunictionType, cmpProductType, cmpGroupCmp }
    }
}

// take values from payload and display them in UI
const mapValuesinUI = (map) => {

    const { campaignId, campaignControlGroup, campaignOffersType, campaignName, campaignCommunicationsType, campaignProductsType, campaignGroup } = map;
    
    document.getElementById("campaign-id").value = campaignId;
    document.getElementById("control-group-k").value = campaignControlGroup;
    document.getElementById("types-of-offers-k").value = campaignOffersType;
    document.getElementById("campaign-name").value = campaignName;
    document.getElementById("communication-type-k").value = campaignCommunicationsType;
    document.getElementById("types-of-products-k").value = campaignProductsType;
    document.getElementById("group-campaign-k").value = campaignGroup;
}

const hideSearchBoxes = () => {
    var searchBoxes = document.getElementsByClassName("form__field--input-search-box");
    if(!searchBoxes) return;
  
    for(let i = 0; i<searchBoxes.length; i++){
      searchBoxes[i].classList.add("inactive")
    }
  }

  // map dropdown values
const mapDropdownValues = (element, options) => {
    if(!options.data.length || !element) return;
    
    element.innerHTML = "";
    for(let i=0; i<options.data.length; i++){
      let option = document.createElement("div");
      option.textContent = options.data[i].values.value;
  
      option.addEventListener("click", function(event){
        const valueSelected = event.target.textContent;
        const searchBox = event.target.parentNode;
        const searchInput = event.target.parentNode.parentNode.getElementsByClassName("form__field--text")[0];
        searchInput.value = valueSelected;
        searchBox.classList.add("inactive");
      });

      element.appendChild(option);
    }
}
  

  const manageSearchClickForStaticFields = (event, type) => {
    const sType = type+"-s";
    const mappedValued = equals(sType,"group-campaign-s") ? groupCampaign : campaignCommunicationsTypes;
    var element = document.getElementById(type);
    mapDropdownValues(element, mappedValued)
    var searchBox = event.target.parentNode.getElementsByClassName("form__field--input-search-box")[0];
    hideSearchBoxes();
    if(searchBox.classList.contains("inactive")){
        hideSearchBoxes();
        searchBox.classList.remove("inactive");
    }else {
        searchBox.classList.add("inactive");
    }
  }
  
  const manageDropDownSearchBox = () =>{
      var searchBoxes = document.getElementsByClassName("form__field--input-drop");
      for (let i = 0; i < searchBoxes.length; i++) {
        
        let dropdownHasConstantValues = searchBoxes[i].classList.contains("fixed")
  
        let searchBoxList = searchBoxes[i].getElementsByClassName("form__field--input-search-box")[0];
        let searchBoxIcon = searchBoxes[i].getElementsByClassName("form__field--icon")[0];
        
        searchBoxIcon.addEventListener("click", function (event) {
          const id = event.target.id;
          
          if(equals(id,"communication-type-s") || equals(id, "group-campaign-s")) { 
            manageSearchClickForStaticFields(event, id.substring(0, id.length - 2));
            return;
          }
  
          var campaignOffersTypesDropdown = document.getElementById("types-of-offers")
          var campaignProductsTypesDropdown = document.getElementById("types-of-products")
  
          if(campaignOffersTypesDropdown) mapDropdownValues(campaignOffersTypesDropdown, campaignOffersTypes)
          if(campaignProductsTypesDropdown) mapDropdownValues(campaignProductsTypesDropdown, campaignProductsTypes)
  
          var searchBox = event.target.parentNode.getElementsByClassName("form__field--input-search-box")[0];
          
          if(searchBox.classList.contains("inactive")){
            hideSearchBoxes();
            searchBox.classList.remove("inactive");
          }else {
            searchBox.classList.add("inactive");
          }
  
        })
  
        let searchBoxInput = searchBoxes[i].getElementsByClassName("form__field--text")[0];
        
        // dropdownHasConstantValues
        // form__field--input-search-box
  
        if(!dropdownHasConstantValues){
          
          searchBoxInput.addEventListener("keyup", function (event) {
            
            const offersOrProducts = equals(event.target.id, "types-of-products-k") ? "PRODUCTS":"OFFERS";
            const mappedData = equals(offersOrProducts,"OFFERS") ? campaignOffersTypes.data : campaignProductsTypes.data;
  
            const value = event.target.value;
            const filteredValues = mappedData.filter(function(item){
              return item.values.value.toLowerCase().startsWith(value.toLowerCase());
            })
  
            if(value) {
              var searchBox = event.target.parentNode.getElementsByClassName("form__field--input-search-box")[0];
              searchBox.innerHTML = "";
  
              for(let i=0; i<filteredValues.length; i++){
                let option = document.createElement("div");
                option.textContent = filteredValues[i].values.value;
  
                option.addEventListener("click", function(event){
                  const valueSelected = event.target.textContent;
                  const searchBoxK = event.target.parentNode;
                  const searchInput = event.target.parentNode.parentNode.getElementsByClassName("form__field--text")[0];
                  searchInput.value = valueSelected;
                  searchBoxK.classList.add("inactive");
                })
  
                searchBox.appendChild(option);
              }
              hideSearchBoxes();
              searchBox.classList.remove("inactive");
            }
          })
        }else {
            searchBoxInput.addEventListener("click", function (event) {
                searchBoxList.classList.remove("inactive");
            })
        }
        
        searchBoxList.classList.add("inactive");
      }
  }
