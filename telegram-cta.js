// SPDX-License-Identifier: MIT
(function () {
  var links = document.querySelectorAll('a[data-telegram-cta="1"]');
  if (!links.length) return;

  for (var i = 0; i < links.length; i += 1) {
    var link = links[i];
    var handle = link.getAttribute("data-telegram-handle");
    if (!handle) continue;

    var template = link.getAttribute("data-telegram-text") ||
      "hi nate -- support request from {title} ({url})";
    var message = template
      .replace("{title}", document.title)
      .replace("{url}", window.location.href);

    link.href = "https://t.me/" + handle + "?text=" + encodeURIComponent(message);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
}());
