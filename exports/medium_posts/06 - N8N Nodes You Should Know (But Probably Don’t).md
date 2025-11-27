<!-- Source: https://medium.com/@mister.funable/n8n-nodes-you-should-know-but-probably-dont-06d61b77c457 -->
<!-- Published: 2025-11-16T00:17:55 -->
# N8N Nodes You Should Know (But Probably Don't)

Everyone talks about AI agents and the amazing workflows that you can automate with N8N, which is cool. I get it. But can we talk about the basics for a second?

<!-- Image Source: https://miro.medium.com/1*nZfdP4SpoEmd-zek_exJFA.png | Local: images/06/img-01.png -->
![](images/06/img-01.png)

I had a couple of projects that I could simplify by migrating to n8n, reducing maintenance and the pain of scope creep. My first surprise was that it wasn't as intuitive as I wanted. Certain nodes were buried in menus with names that don't exactly scream "use me!" or would make sense right away.

## The Basics Everyone Skips

Before you build a multi-agent system that orders pizza based on your Spotify listening habits, maybe get comfortable with these:

### Triggers (How Workflows Start)

- **Manual Trigger**: Click a button to run the workflow. This is the basic one you start with, especially when you're just learning n8n. Perfect for testing and playing around with nodes to see how they work.

- **Schedule Trigger**: Run workflows on a timer. Every hour, every day, every Monday at 9 AM. Set it and forget it. Perfect for data syncs and report generation, or in my case automated posts.

- **Chat Trigger**: Start workflows from the chat within N8N. It was actually very helpful when I required to automate the data recollection for a side project.

- **Webhook**: Let external services trigger your workflows. Form submissions, API calls from other apps, webhooks from services that don't have dedicated nodes, this handles it all.

### Data Transformation

- **Edit Fields (Set)**: Set variables, create new fields, transform data. Not obvious from the name, but you'll use it everywhere once you know it exists.

- **Item Lists**: Need to select the first item from an array? Sort items? Remove duplicates? This is the node. Super useful for cleaning up data before processing.

- **Filter**: Remove items that don't match specific conditions. Great for cleaning up API responses or filtering spreadsheet data.

- **Aggregate**: Combine multiple items into one. Sum values, count items, find min/max. Perfect for generating reports or stats.

### Flow Control

- **IF**: Conditional logic. "If this is true, go here. If not, go there." Simple but essential for building workflows that actually make decisions.

- **Switch**: Like IF but with multiple paths. Route items based on different conditions without chaining a bunch of IF nodes together.

- **Loop Over Items**: Process a list of items one by one. Got 50 URLs to hit? Loop through them. Have spreadsheet rows to process? Loop's got you covered.

- **Merge**: Combine data from multiple branches. When you split your workflow and need to bring it back together.

- **Split Out**: Send items down multiple paths. The opposite of Merge.

### Core Nodes

- **Sticky Note**: Not technically a node, but seriously underrated. Leave notes for yourself (or your future self) about what a section of the workflow does. Six months later, you'll thank yourself.

- **HTTP Request**: This is really helpful. You skip needing a library but without having to go to curl directly. Any service with an API? HTTP node can handle it. Hit any REST API, send custom headers, parse responses however you want. For 90% of API calls, this keeps things simple and visual.

- **Code**: Write JavaScript or Python when nodes can't do what you need. More powerful than HTTP for complex logic, but harder to maintain. Use it when you actually need it, not as a first resort.

- **Webhook**: Receive data from external services. Someone fills out a form? Webhook catches it. Another app needs to trigger your workflow? Webhook handles it.

### File Operations

- **Read/Write Files from Binary Data**: Upload files, download them, convert between formats. If your workflow touches files at all (PDFs, images, CSVs), you need this. Keep in mind [it may not work with heavy files](https://medium.com/@mister.funable/how-not-to-work-with-local-files-in-n8n-8c4545a3f2b2).

### Human in the Loop

It uses a messaging service like Slack, and other alternatives like email or the N8N chat.

- **Wait**: Pause your workflow. Wait for a webhook response, wait 5 minutes between API calls to avoid rate limits, or just add a delay between actions. More useful than you'd think.

- **Approve (n8n Form)**: Pause the workflow until someone approves or rejects. Great for things that need human judgment before proceeding.

## Action in an App (Service Integrations)

Alright, once you've got the basics down, here are some service-specific nodes that are actually useful:

### Productivity & Storage

- **Airtable / Google Sheets**: Read, write, and update rows. Perfect for quick databases when you don't want to spin up PostgreSQL.

- **Google Drive**: Upload processed data, grab files to work with, organize your exports. Especially useful with Loop for batch processing.

### Communication & Notifications

- **Slack**: Notifications. Workflow finished? Ping Slack. Something broke? Ping Slack. You finally automated that annoying task? Definitely ping Slack so everyone knows.

- **Discord**: Same idea as Slack but for Discord servers. Post messages, create threads, manage channels.

- **Telegram**: Send messages, receive commands, manage bots. Surprisingly useful for personal notifications too.

- **Twitter/X**: Post tweets, monitor mentions, search hashtags. Automate your social media presence without paying for Buffer.

- **LinkedIn**: Share posts, manage company pages. Great for automated content distribution.

### Data & APIs

- **PostgreSQL / MySQL / MongoDB**: Direct database access. Query, insert, update data without needing an API layer.

- **Redis**: Store temporary data, cache results, manage queues. Perfect for workflows that need to remember stuff between runs.

## AI Agent Nodes

The AI Agent node is powerful, but it's also confusing if you just drag it into a workflow and hope for the best. Here's what you actually need to know:

### Key Configuration Options

- **Chat Model**: Connect to OpenAI, Anthropic, or local models. This is your AI brain. Different models have different strengths (and costs).

- **System Prompt**: Tell the AI what it is and how it should behave. "You are a helpful assistant" vs "You are a sarcastic tech support agent". Makes a huge difference.

- **Tools**: This is where it gets interesting. You can give the AI access to specific actions it can take.

### Tools Worth Knowing

- **Simple Database Tool**: Let the AI store and retrieve information between conversations. It can "remember" things without you building a whole database setup. Great for chat bots that need context.

- **Output Parser Tool**: Force the AI to return structured data (JSON, specific formats). Instead of getting a paragraph, you get data you can actually use in the next node.

- **HTTP Request Tool**: The AI can make API calls on its own. It decides when to call an API, what parameters to use, and how to interpret the response. Wild but useful.

- **Code Tool**: Let the AI write and execute code to solve problems. Combine this with the HTTP tool and you've got an AI that can figure out complex workflows on its own.

### Combining AI Tools

Here's where it clicks: you can give the AI multiple tools at once.

- **Give it the Simple Database Tool + Output Parser?** Now it can remember past conversations and return structured data.

- **Give it HTTP Request + Code Tool?** It can call APIs, process the response with custom code, and hand you back clean results.

The trick is knowing when to use AI agents vs regular nodes. If the logic is predictable, use IF and Loop. If you need the workflow to make decisions based on natural language or complex context, that's when the AI Agent shines.

## Community Nodes

One more thing: n8n has community-built nodes for tons of services that aren't officially supported yet.

Go to **Settings** > **Community Nodes** and you can install nodes other people built.

Quality varies (it's community-built, after all), but when you need a specific integration and it's not in the official node list, check the community nodes first. Saves you from writing custom complex integrations.

Just be aware: community nodes can break if the maintainer abandons them or if n8n updates break compatibility. But for side projects? They're usually fine.

## Why This Matters

Here's why I'm writing this: N8N is great, but its flexibility can be overwhelming. The sexy stuff (AI! Agents! Automation!) gets all the attention, but you can't build complex workflows if you don't know about Edit Fields and Loop.

It's like trying to build a house when you only know about smart home tech. Cool, but... maybe learn about hammers first?

Once you're comfortable with these basics (Edit Fields for data manipulation, IF and Loop for logic, HTTP for flexibility), you can build pretty much anything. The fancy AI nodes are just icing on the cake.

## Start Simple

If you're new to N8N, don't feel like you need to build something complicated right away. Grab a template, click through the nodes, see what they actually do, set the credentials (that will be a fun experience).

And if you've never touched Loop or HTTP? Give them a shot. If that's still too much, try locally with commands before trying to translate that workflow into N8N.

Got other "hidden gem" nodes I should know about? Drop a comment. I'm always finding out about features I didn't know existed.
