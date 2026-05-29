import { parseVttToText } from '../src/videoTranscriptFetcher';

describe('parseVttToText', () => {
  it('strips WEBVTT header and timestamp lines', () => {
    const vtt = `WEBVTT

00:00:00.000 --> 00:00:03.000
Hello everyone

00:00:03.000 --> 00:00:06.000
welcome to the call`;
    expect(parseVttToText(vtt)).toBe('Hello everyone welcome to the call');
  });

  it('strips inline HTML tags', () => {
    const vtt = `WEBVTT

00:00:00.000 --> 00:00:02.000
<c>Revenue</c> was <b>14.9</b> billion`;
    expect(parseVttToText(vtt)).toBe('Revenue was 14.9 billion');
  });

  it('deduplicates adjacent identical lines', () => {
    const vtt = `WEBVTT

00:00:00.000 --> 00:00:02.000
Hello

00:00:01.000 --> 00:00:03.000
Hello

00:00:03.000 --> 00:00:05.000
World`;
    expect(parseVttToText(vtt)).toBe('Hello World');
  });

  it('returns empty string for blank VTT', () => {
    expect(parseVttToText('WEBVTT\n\n')).toBe('');
  });
});
