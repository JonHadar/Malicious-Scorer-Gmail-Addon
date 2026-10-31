/**

# Malicious Scorer - Gmail Security Add-on 🛡️

## Overview
A native Google Workspace Add-on integrated directly into Gmail. This tool acts as a real-time phishing analyzer, scanning incoming emails to calculate a risk score (0-100) based on local heuristics, user-defined configurations, and global threat intelligence.

## 🏗️ Architecture
The add-on is built entirely on Google Apps Script, utilizing a serverless architecture.
1. Frontend (Server-Driven UI): User interfaces are rendered server-side. This ensures native compatibility across Gmail on the Web, Android, and iOS without maintaining separate codebases.
2. Backend Logic: JavaScript-based rule engine that extracts email metadata, processes regex evaluations, and executes scoring algorithms.
3. Storage: Native cloud storage utilizing Google's infrastructure to save user-specific configurations securely.
4. External Enrichment: Real-time integration with the VirusTotal API to cross-reference sender domains against global threat intelligence databases, enriching local heuristics with external data.

## 🔌 APIs Used
1. Gmail Add-ons API (`messageMetadata`): Used to extract the contextual data of the currently opened email (e.g., Message ID, Access Tokens) to parse the sender's domain.
2. CardService API: The official Google Workspace API used to construct the dynamic Server-Driven UI (Cards, Widgets, DecoratedText, and Navigation routing).
3. PropertiesService API:** Serves as the cloud database to persistently store and retrieve the user's custom Blacklist domains.
4. VirusTotal API v3 & UrlFetchApp: External REST API integration. The add-on issues secure HTTP GET requests to VirusTotal's threat intelligence database to dynamically enrich the risk score     based on global security vendor votes.

## ✨ Implemented Features
1. Real-Time Risk Scoring: Calculates a dynamic score and provides clear visual indicators: 🟢 CLEAN (0), 🟡 SAFE (>0), 🟠 SUSPICIOUS (30+), and 🔴 MALICIOUS (70+).
2. Explainability: The UI doesn't just show a number; it provides a dedicated "Analysis Reasons" section detailing the exact factors that contributed to the score.
3. Dynamic Enrichment: Automatically queries VirusTotal to check if the sender's domain is flagged by global security vendors.
4. Interactive Blacklist Management:** Users can add or remove domains from a custom blacklist. The UI features dynamic re-rendering (updating the card stack) to reflect changes immediately.

## ⚠️ Limitations & Future Enhancements
While the current MVP successfully demonstrates real-time threat analysis, there are several areas identified for future enhancement to reach enterprise-grade production readiness:
1. Attachment Scanning: Currently based on metadata attributes (file extensions) instead of deep sandbox execution. Future improvements will include dynamic analysis of file content.
2. URL Extraction & Scanning: Planning to implement URL extraction and deep scanning within email bodies to identify malicious links.
3. High Volume Optimization: Improving API rate-limiting management for high-volume email users, including smart caching mechanisms.

*/