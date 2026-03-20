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

  function text(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
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
        var highAdds = [];
        var mediumAdds = [];
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
            highAdds.push(
              field.getAttribute("data-add-high") ||
              field.getAttribute("data-risk-high") ||
              "define a single highest-leverage addition with explicit owner and date."
            );
          } else if (value < fieldMax) {
            mediumAdds.push(
              field.getAttribute("data-add-mid") ||
              field.getAttribute("data-risk-mid") ||
              "tighten the current plan into one measurable next addition."
            );
          }
        }

        var additions = highAdds.concat(mediumAdds);
        while (additions.length < 3) {
          additions.push("install one operator feedback loop that shortens decision latency.");
        }

        var topAdditions = additions.slice(0, 3);
        var tier = scoreTier(total);
        var summary = "survey score " + total + "/" + max + " (" + tier + ").";
        var output = form.parentNode.querySelector("[data-ai-stress-output]");
        if (output) {
          output.hidden = false;
          output.textContent = summary + " smartest next addition: " + topAdditions[0];
        }

        var message = [
          "single smartest addition survey submission",
          "score: " + total + "/" + max + " (" + tier + ")",
          "top_additions:",
          "1) " + topAdditions[0],
          "2) " + topAdditions[1],
          "3) " + topAdditions[2],
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
        var contactName = text(form.elements.contact_name.value);
        var businessName = text(form.elements.business_name.value);
        var preferredChannel = text(form.elements.preferred_channel.value) || "telegram";
        var contactDetail = text(form.elements.contact_detail.value);
        var orgType = form.elements.org_type.value || "small_business";
        var operatingRegion = form.elements.operating_region.value || "other_region";
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
        var discountRate = 0;
        var discountLabel = "standard pricing lane";

        if (orgType === "nonprofit" || orgType === "education") {
          discountRate = 0.2;
          discountLabel = "community discount lane (20%)";
        } else if (orgType === "factory_side_hustle") {
          discountRate = 0.15;
          discountLabel = "factory side-hustle lane (15%)";
        }

        var discountedLow = lowAnchor * (1 - discountRate);
        var discountedHigh = highAnchor * (1 - discountRate);
        var lane = "external queue";
        var responseSla = "review within 72 hours";
        if (operatingRegion === "puyallup_territory") {
          lane = "hyper-local priority";
          responseSla = "same business day";
        } else if (operatingRegion === "wa_wider") {
          lane = "regional lane";
          responseSla = "within 24-48 hours";
        }

        var output = form.parentNode.querySelector("[data-value-calc-output]");
        if (output) {
          output.hidden = false;
          if (discountRate > 0) {
            output.textContent =
              "annual value estimate " + usd(annualValue) +
              ". base consulting band " + usd(lowAnchor) + " to " + usd(highAnchor) +
              ". discounted consulting band " + usd(discountedLow) + " to " + usd(discountedHigh) +
              " via " + discountLabel +
              ". routing: " + lane + ", response sla " + responseSla + ".";
          } else {
            output.textContent =
              "annual value estimate " + usd(annualValue) +
              ". value-based consulting band " + usd(lowAnchor) + " to " + usd(highAnchor) +
              " (10-20% of captured annual value)." +
              " routing: " + lane + ", response sla " + responseSla + ".";
          }
        }

        var message = [
          "hyper-local consulting pipeline submission",
          "contact_name: " + contactName,
          "business_name: " + businessName,
          "preferred_channel: " + preferredChannel,
          "contact_detail: " + contactDetail,
          "org_type: " + orgType,
          "operating_region: " + operatingRegion,
          "routing_lane: " + lane,
          "response_sla: " + responseSla,
          "annual_value: " + usd(annualValue),
          "recovered_revenue: " + usd(recoveredRevenue),
          "cost_savings: " + usd(costSavings),
          "risk_avoidance: " + usd(riskAvoidance),
          "value_based_pricing_band: " + usd(lowAnchor) + " to " + usd(highAnchor),
          "discount_lane: " + discountLabel,
          "discounted_consulting_band: " + usd(discountedLow) + " to " + usd(discountedHigh),
          "delivery_model: consultant-led implementation",
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
