<!-- Source: https://medium.com/@mister.funable/meshtastic-questions-i-had-after-getting-started-b0a634a39bae -->
<!-- Published: 2025-11-14T18:19:05 -->
# Meshtastic Questions I Had After Getting Started

<!-- Image Source: https://miro.medium.com/1*ajeAjkTcA-PlmUn5P1fo3A.png | Local: images/04/img-01.png -->
![](images/04/img-01.png)

[After flashing my first Meshtastic device](https://medium.com/@mister.funable/getting-started-with-meshtastic-on-heltec-v3-and-lilygo-t-beam-e287f44df7b8), I had about a hundred questions. Here are the ones I actually figured out, organized from "**complete beginner**" to "**okay, now we're getting somewhere.**"

## The Basics

### Why would I use Meshtastic?

Off-grid communication. That's the short answer.

The longer answer: it's a mesh network using LoRa radios, so you can send messages without cell towers, Wi-Fi, or any traditional infrastructure. Good for hiking in the middle of nowhere, emergencies when networks go down, or just having a backup communication method that doesn't rely on your ISP staying operational.

Not quite prepper territory, but practical enough that it makes sense even if you're not planning for the apocalypse.

### What devices work with Meshtastic?

The most common ones are:

- **LILYGO T-Beam**: Has GPS built in, battery holder, good for portable use. This is what I bought.

- **Heltec V3**: Compact, has a screen, cheaper option.

- **RAK WisBlock**: Modular system, more flexibility if you want to customize.

All of them need an ESP32 microcontroller and a LoRa radio module. Make sure you buy one that matches your region's frequency (915 MHz for the US, 868 MHz for Europe, etc.).

### Wait, what's an ESP32?

It's a microcontroller (basically a tiny computer chip) that handles Bluetooth, Wi-Fi, and runs the Meshtastic firmware. Think of it as the brain of the device. Most Meshtastic boards use ESP32 because it's cheap, powerful enough, and has everything needed for wireless communication.

You don't need to know much about it. Just know that when people say "ESP32-based device," they mean it'll work with Meshtastic.

### What can LoRa actually do?

LoRa = Long Range. It's a radio technology that trades speed for distance. You're not streaming Netflix over this thing, but you can send text messages over several kilometers (sometimes 100+ km in ideal conditions, but don't count on it).

Here's the catch: it's line-of-sight dependent. Buildings, trees, and mountains will block signals. In a city? Maybe a few kilometers. On a mountain with clear views? Much farther.

The mesh part means if your message can't reach someone directly, other Meshtastic devices in range will relay it. The more devices in an area, the better the network works.

---

## Configuration Stuff

### What do all these channel settings mean?

Channels are how you organize communication. Think of them like chat rooms.

- **Primary channel**: The main one everyone uses. Usually set to "LongFast" for decent range and speed.

- **Secondary channels**: Additional channels you can create for private groups or specific purposes.

Each channel has settings like:

- **Name**: Just a label for you to identify it

- **PSK (Pre-Shared Key)**: The encryption key. Devices need the same PSK to talk to each other

- **Modem preset**: Trades off between range and speed (LongFast, LongSlow, etc.)

- **Hop limit**: How many times a message can be relayed (usually 3 or 4)

If you're just starting, stick with the defaults. The LongFast preset works fine for most situations.

### Can I have more than one channel?

Yes. You can have multiple channels on a single device. The primary channel is always active, and you can add secondary ones for private conversations or different groups.

Just remember that all devices need to share the same channel settings (name and PSK) to communicate on that channel.

### Where is everyone?

Good question. LoRa has limited range, so you'll only see nearby devices. If you're in a populated area with an active Meshtastic community, you'll see nodes pop up. If you're in the middle of nowhere, it'll be quiet unless you have multiple devices yourself.

Want to see what's going on beyond LoRa range? That's where MQTT comes in.

## The MQTT Situation

### Do I need MQTT?

Kinda.

You don't _**need**_ it for basic device-to-device communication. If you just want to message between your own devices or nearby people, skip MQTT entirely.

But if you want to:

- See messages from Meshtastic users far away.

- Bridge your local mesh to the internet.

- Connect to services like Telegram.

- Then yeah, you'll want MQTT enabled.

### What does MQTT actually do?

MQTT is a messaging protocol that lets your device send/receive messages over the internet. Think of it as a bridge between the local LoRa mesh and a wider network.

There are public MQTT servers (like mqtt.meshtastic.org) that anyone can connect to. When you enable MQTT, your device uploads messages to that server, and other devices connected to the same server can see them.

**The catch**: This reveals your location and messages to anyone on that MQTT server. If you're using the public server and talking on a default channel, assume it's public information. Use encryption (custom PSK) if you want privacy.

### How does the Telegram bridge work?

Some people set up bots that connect MQTT to Telegram. Messages sent on the Meshtastic network get forwarded to a Telegram group, and vice versa.

It's not built into Meshtastic. Someone has to run a script/bot that monitors MQTT and forwards messages to Telegram. If your local community has one set up, you can connect to it. Otherwise, you'd need to set it up yourself (which involves running a server somewhere).

Honestly? It's neat but not essential unless you want to stay connected to the mesh when you're away from your device.

---

## Other Things You Can Do

A few things I learned you can configure:

- **Device roles**: Set your device as a Client (normal use), Router (prioritizes relaying messages), or Client Mute (doesn't relay anything). Routers are good if you're setting up a fixed node somewhere with good coverage.

- **Power settings**: Adjust how much power your device uses for transmission. Higher power = longer range but drains battery faster.

- **Position sharing**: If your device has GPS, it can broadcast your location. You can set how often it updates and whether it shares at all.

- **Store and forward**: Some nodes can store messages and forward them later. Useful for extending the network when devices come in and out of range.

---

## What I'm Still Figuring Out

- How to optimize channel settings for my specific area

- Whether running a fixed router node at home is worth it

- Best practices for battery life on portable devices

- How to actually find other Meshtastic users nearby

If you know answers to any of these, or have other tips, let me know. This whole thing is still pretty new to me, but it's been interesting to play with so far.
