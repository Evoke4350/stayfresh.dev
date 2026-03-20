// SPDX-License-Identifier: MIT
(function () {
  function buildTelegramUrl(handle, message) {
    return "https://t.me/" + handle + "?text=" + encodeURIComponent(message);
  }

  function hydrateTelegramLinks() {
    var links = document.querySelectorAll('a[data-telegram-cta="1"]');
    for (var i = 0; i < links.length; i += 1) {
      var link = links[i];
      var handle = link.getAttribute("data-telegram-handle");
      if (!handle) continue;

      var template = link.getAttribute("data-telegram-text") ||
        "hi evoke86 -- support request from {title} ({url})";
      var message = template
        .replace("{title}", document.title)
        .replace("{url}", window.location.href);

      link.href = buildTelegramUrl(handle, message);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  }

  function scoreTier(score) {
    if (score >= 9) return "operational";
    if (score >= 7) return "stable";
    if (score >= 5) return "exposed";
    return "critical";
  }

  function wireStressTests() {
    var forms = document.querySelectorAll("form[data-ai-stress-test]");
    for (var i = 0; i < forms.length; i += 1) {
      forms[i].addEventListener("submit", function (event) {
        event.preventDefault();

        var form = event.currentTarget;
        var handle = form.getAttribute("data-telegram-handle") || "Evoke86";
        var fields = form.querySelectorAll("select[data-ai-score]");
        var total = 0;
        var max = 0;
        var highRisks = [];
        var mediumRisks = [];
        var answers = [];

        for (var j = 0; j < fields.length; j += 1) {
          var field = fields[j];
          var value = Number(field.value || 0);
          var fieldMax = Number(field.getAttribute("data-ai-score") || 2);
          var name = field.name || ("q" + (j + 1));

          total += value;
          max += fieldMax;
          answers.push(name + "=" + value + "/" + fieldMax);

          if (value === 0) {
            highRisks.push(field.getAttribute("data-risk-high"));
          } else if (value < fieldMax) {
            mediumRisks.push(field.getAttribute("data-risk-mid"));
          }
        }

        var risks = highRisks.concat(mediumRisks);
        while (risks.length < 3) {
          risks.push("decision latency risk: no fast operator feedback loop for ai change control.");
        }

        var topRisks = risks.slice(0, 3);
        var tier = scoreTier(total);
        var summary = "stress test score " + total + "/" + max + " (" + tier + ").";
        var output = form.parentNode.querySelector("[data-ai-stress-output]");
        if (output) {
          output.hidden = false;
          output.textContent = summary + " top risk: " + topRisks[0];
        }

        var message = [
          "ai philosophy stress test submission",
          "score: " + total + "/" + max + " (" + tier + ")",
          "top_risks:",
          "1) " + topRisks[0],
          "2) " + topRisks[1],
          "3) " + topRisks[2],
          "answers: " + answers.join(", "),
          "source: " + window.location.href
        ].join("\n");

        var url = buildTelegramUrl(handle, message);
        var popup = window.open(url, "_blank", "noopener,noreferrer");
        if (!popup) {
          window.location.href = url;
        }
      });
    }
  }

  hydrateTelegramLinks();
  wireStressTests();
}());
