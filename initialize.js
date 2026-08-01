// load tools
function addTools() {

    const toolbar = document.getElementById('toolbar');
    
    const json_data = await fetch('tools.json');
    if (!json_data.ok){
        console.error("Failed to load tools.json");
        return;
    }
    tool_data = await json_data.json();

    renderMainToolbar(tool_data.mainTools);
    renderSubTOolbar('effect'); // initial select

}
document.addEventListener('DOMContentLoaded', addTools);