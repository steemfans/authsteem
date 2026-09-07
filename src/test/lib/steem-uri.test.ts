import { describe, expect, it } from 'vitest'
import { decode } from '@/lib/steem-uri'

// base64u of JSON ["comment",{...title:'让本地模型干活'...}] as raw UTF-8 bytes,
// i.e. what every producer emits; @steemit/steem-uri 0.2.1 decoded this to mojibake.
function b64u(json: string): string {
  return Buffer.from(json, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '.')
}

describe('steem-uri UTF-8 decoding', () => {
  it('decodes CJK comment op without mojibake', async () => {
    const op = [
      'comment',
      {
        parent_author: '',
        parent_permlink: 'cn',
        author: 'ety001',
        permlink: 'test',
        title: '让本地模型干活：调优实录',
        body: '中文正文 with mixed ASCII ✓',
        json_metadata: '{"tags":["cn"]}',
      },
    ]
    const { tx } = await decode(`steem://sign/op/${b64u(JSON.stringify(op))}`)
    expect(tx.operations[0]).toEqual(op)
  })

  it('decodes CJK callback param without mojibake', async () => {
    const op = ['vote', { voter: 'a', author: 'b', permlink: 'p', weight: 10000 }]
    const cb = 'https://example.com/回调?msg=完成'
    const { params } = await decode(
      `steem://sign/op/${b64u(JSON.stringify(op))}?cb=${b64u(cb)}`
    )
    expect(params.callback).toBe(cb)
  })

  it('rejects payloads that are not valid UTF-8', async () => {
    const garbage = Buffer.from([0xff, 0xfe, 0x00])
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    await expect(decode(`steem://sign/op/${garbage}`)).rejects.toThrow(/Invalid payload/i)
  })
})
