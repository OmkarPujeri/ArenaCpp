async function submitCode() {
    const code = document.getElementById("code").value;

    const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            code: code,
            problemId: "problem1"
        })
    });

    const data = await response.json();

    document.getElementById("result").innerText =
        "Verdict: " + data.verdict;
}