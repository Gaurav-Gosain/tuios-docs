**Plan:** This is how a retry waits now.

```mermaid
flowchart LR
  A[Try] -->|fails| B[Back off]
  B --> C{Over the cap?}
  C -->|yes| D[Wait the cap]
  C -->|no| E[Wait]
  D --> A
  E --> A
```

```tml
<tml version="1">
  <kv>
    <item k="Runs" v="200"/>
    <item k="Failures" v="0" role="success"/>
    <item k="Longest wait" v="1800ms"/>
  </kv>
</tml>
```
