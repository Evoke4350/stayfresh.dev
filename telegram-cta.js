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

  function num(value) {
    var parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return parsed;
  }

  function percent(value) {
    var n = num(value);
    if (n < 0) return 0;
    if (n > 100) return 1;
    return n / 100;
  }

  function usd(value) {
    var amount = Math.max(0, Math.round(num(value)));
    return "$" + amount.toLocaleString("en-US");
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

  function wireValueCalculators() {
    var forms = document.querySelectorAll("form[data-value-calc]");
    for (var i = 0; i < forms.length; i += 1) {
      forms[i].addEventListener("submit", function (event) {
        event.preventDefault();

        var form = event.currentTarget;
        var handle = form.getAttribute("data-telegram-handle") || "Evoke86";
        var leadVolume = num(form.elements.lead_volume.value);
        var missedLeadRate = percent(form.elements.missed_lead_rate.value);
        var responseLift = percent(form.elements.response_lift.value);
        var closeRate = percent(form.elements.close_rate.value);
        var avgDealValue = num(form.elements.avg_deal_value.value);
        var hoursSavedWeek = num(form.elements.hours_saved_week.value);
        var loadedHourlyCost = num(form.elements.loaded_hourly_cost.value);
        var contractPenaltyRisk = num(form.elements.contract_penalty_risk.value);
        var churnRiskReduction = num(form.elements.churn_risk_reduction.value);

        var recoveredRevenue = leadVolume * missedLeadRate * responseLift * closeRate * avgDealValue * 12;
        var costSavings = hoursSavedWeek * loadedHourlyCost * 52;
        var riskAvoidance = contractPenaltyRisk + churnRiskReduction;
        var annualValue = recoveredRevenue + costSavings + riskAvoidance;
        var lowAnchor = annualValue * 0.1;
        var highAnchor = annualValue * 0.2;

        var output = form.parentNode.querySelector("[data-value-calc-output]");
        if (output) {
          output.hidden = false;
          output.textContent =
            "annual value estimate " + usd(annualValue) +
            ". value-based engagement band " + usd(lowAnchor) + " to " + usd(highAnchor) +
            " (10-20% of captured annual value).";
        }

        var message = [
          "value capture calculator submission",
          "annual_value: " + usd(annualValue),
          "recovered_revenue: " + usd(recoveredRevenue),
          "cost_savings: " + usd(costSavings),
          "risk_avoidance: " + usd(riskAvoidance),
          "value_based_pricing_band: " + usd(lowAnchor) + " to " + usd(highAnchor),
          "pricing_model: value-based, not hourly",
          "inputs:",
          "- lead_volume_per_month=" + leadVolume,
          "- missed_lead_rate_percent=" + Math.round(missedLeadRate * 1000) / 10,
          "- response_lift_percent=" + Math.round(responseLift * 1000) / 10,
          "- close_rate_percent=" + Math.round(closeRate * 1000) / 10,
          "- avg_deal_value=" + usd(avgDealValue),
          "- hours_saved_per_week=" + hoursSavedWeek,
          "- loaded_hourly_cost=" + usd(loadedHourlyCost),
          "- contract_penalty_risk=" + usd(contractPenaltyRisk),
          "- churn_risk_reduction=" + usd(churnRiskReduction),
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
  wireValueCalculators();
}());
