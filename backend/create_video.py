import os
from moviepy import VideoFileClip, AudioFileClip, TextClip, CompositeVideoClip
import webvtt

MAX_AUDIO_DURATION = 60

def create_video(video_path, audio_path, subtitle_path, output_dir) -> str:
    """
    Combine the video, audio, and subtitles to create a final video.

    Args:
        video_path (str): Path to the input video file.
        audio_path (str): Path to the input audio file.
        subtitle_path (str): Path to the input subtitle file.
        output_dir (str): Directory to save the output video file.

    Returns:
        str: Path to the generated video file.
    """
    audio_duration = get_audio_duration(audio_path)

    if audio_duration > MAX_AUDIO_DURATION:
        audio = AudioFileClip(audio_path).subclipped(0, MAX_AUDIO_DURATION)
        audio_duration = MAX_AUDIO_DURATION
    else:
        audio = AudioFileClip(audio_path)

    video = VideoFileClip(video_path).subclipped(0, audio_duration)
    subtitles = create_subtitle_clips(subtitle_path, audio_duration)

    final_video = CompositeVideoClip([video] + subtitles).with_audio(audio)
    filename = os.path.basename(audio_path).split('.')[0] + '.mp4'
    output_path = os.path.join(output_dir, filename)
    final_video.write_videofile(output_path, threads=12)



def get_audio_duration(audio_path: str) -> int:
    """
    Get the duration of an audio file.

    Args:
        audio_path (str): Path to the audio file.

    Returns:
        int: Duration of the audio file in seconds.
    """
    audio = AudioFileClip(audio_path)
    return int(audio.duration) + 1

def create_subtitle_clips(subtitle_path, audio_duration):
    """
    Create TextClip instances from a .vtt subtitle file.

    Args:
        subtitle_path (str): Path to the .vtt subtitle file.
        video_size (tuple): Size of the video (width, height).

    Returns:
        list: List of TextClip instances.
    """
    subtitle_clips = []
    for caption in webvtt.read(subtitle_path):
        start_time = convert_timestamp(caption.start)
        end_time = convert_timestamp(caption.end)
        text = caption.text

        subtitle_clip = TextClip(
            text=text,
            font="./monst.ttf",
            font_size=90,
            color="white",
            bg_color=None,
            method="label",
            text_align="center",
        )
        subtitle_clip = (
            subtitle_clip.with_start(start_time)
            .with_end(end_time)
            .with_position(("center"))
        )
        
        if end_time > (audio_duration - 0.5):
            return subtitle_clips

        subtitle_clips.append(subtitle_clip)

    return subtitle_clips


def convert_timestamp(timestamp):
    """
    Convert a timestamp from .vtt format to seconds.

    Args:
        timestamp (str): Timestamp in .vtt format (HH:MM:SS.mmm).

    Returns:
        float: Timestamp in seconds.
    """
    h, m, s = timestamp.split(':')  # Split into hours, minutes, and seconds.milliseconds
    s, ms = s.split('.')  # Split seconds and milliseconds
    total_seconds = int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000
    return total_seconds

create_video('video_3.mp4', 'jessica_3.mp3', '3.vtt', 'output')