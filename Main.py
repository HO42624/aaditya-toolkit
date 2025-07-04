from flask import Flask, render_template_string, request
import os, requests

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def home():
    output = ""
    if request.method == "POST":
        tool = request.form["tool"]
        if tool == "System Info":
            output = os.popen("uname -a").read()
        elif tool == "Instagram Reels":
            output = "Coming soon: Insta Reels Downloader"
        elif tool == "Village Weather":
            village = request.form.get("village", "")
            if village:
                try:
                    r = requests.get(f"http://wttr.in/{village}?format=3")
                    output = r.text
                except:
                    output = "Weather fetch failed!"
    return render_template_string('''
    <form method="post">
        <select name="tool" onchange="toggleInput(this.value)">
            <option>System Info</option>
            <option>Instagram Reels</option>
            <option>Village Weather</option>
        </select><br><br>
        <input name="village" id="villageInput" placeholder="Enter village name" style="display:none;"><br>
        <button type="submit">Run</button>
    </form>
    <pre>{{output}}</pre>
    <script>
    function toggleInput(val) {
        document.getElementById("villageInput").style.display = 
            val === "Village Weather" ? "block" : "none";
    }
    </script>
    ''', output=output)

app.run(host="0.0.0.0", port=3000)