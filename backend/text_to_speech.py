import os
from edge_tts import Communicate, SubMaker, VoicesManager
from langdetect import detect
import asyncio
import random


def text_to_speech(input_path: str, output_dir: str) -> tuple[str, str]:
    """
    Convert text content to speech and word-level subtitles.

    Args:
        input_path (str): Path to the input text file.
        output_dir (str): Directory to save the output .mp3 and .srt files.

    Returns:
        tuple[str, str]: Paths to the generated .mp3 and .srt files.
    """

    file_name, _ = os.path.splitext(os.path.basename(input_path))
    audio_output_path = os.path.join(output_dir, f"{file_name}.mp3")
    subtitle_output_path = os.path.join(output_dir, f"{file_name}.vtt")

    with open(input_path, "r", encoding="utf-8") as file:
        text = file.read()

    try:
        lang = detect(text)
    except:
        lang = "multilang"

    voices = asyncio.run(get_voices(lang))

    communicate = Communicate(text=text, voice=random.choice(voices)["Name"])
    submaker = SubMaker()

    async def save_files():
        with open(audio_output_path, "wb") as file:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    file.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    submaker.create_sub(
                        (chunk["offset"], chunk["duration"]), chunk["text"].upper()
                    )
        with open(subtitle_output_path, "w", encoding="utf-8") as file:
            file.write(submaker.generate_subs(words_in_cue=1))

    asyncio.run(save_files())

    return audio_output_path, subtitle_output_path


async def get_voices(lang: str) -> list:
    vm = await VoicesManager.create()
    locale = "en-US"
    base_voices = vm.find(Locale=locale)
    base_voices = [
        voice
        for voice in base_voices
        if "Cute" not in voice["VoiceTag"]["VoicePersonalities"]
    ]
    if lang == "en":
        return base_voices
    multiple_lang_voices = [
        voice for voice in base_voices if "Multilingual" in voice["Name"]
    ]
    if lang == "multilang":
        return multiple_lang_voices
    voices = vm.find(Language=lang)
    # add multilingual voices and avoid duplicates
    for voice in multiple_lang_voices:
        if voice not in voices:
            voices.append(voice)
    return voices
