# @os-community/academy-client

OS_Content Academy Content API 向け TypeScript クライアント。

## 使用例

```typescript
import { AcademyClient } from "@os-community/academy-client";

const client = new AcademyClient({
  baseUrl: process.env.ACADEMY_API_URL!,
  timeoutMs: 10_000,
});

const tracks = await client.getTracks();
const lesson = await client.getLesson("lesson-openorgos-philosophy-001");
```

ブラウザから Content API を直接呼ばず、Next.js BFF または Server Component 経由で利用してください。
