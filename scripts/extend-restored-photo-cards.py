"""Append twelve reviewed, fully photographed pairs; never regenerate old lessons.

Uses exact CJKVI IDS + Make Me a Hanzi stroke matches. Missing photographs or
unmatched strokes stop the import before any published data is written.
"""
import hashlib
import json
import pathlib
from urllib.parse import quote

project = pathlib.Path(__file__).resolve().parents[1]
workspace = project.parents[1]
data_dir = project / 'src/data'
source_dir = project / 'public/sources'
date = '2026-11-07'
cjkvi_url = 'https://github.com/cjkvi/cjkvi-ids/blob/86b4d16159f0079437870408f0ca186e529015db/ids.txt'
mmh_revision = 'bddc96d41bef78427ed0e034e9f7e31d71fd1b92'


def load(path):
    return json.loads(path.read_text())


def source(h, title=None, url=None):
    return {'title': title or '香港中文大学《汉语多功能字库》·' + h,
            'url': url or 'https://humanum.arts.cuhk.edu.hk/Lexis/lexi-mf/search.php?word=' + quote(h),
            'accessed': date}


# Current meanings and examples are intentionally separate from origin claims.
# Tuple: char, left, right, root family, pinyin, Chinese meaning, Korean,
#        example Chinese/pinyin/Korean, modern scene key.
lessons = [
    ('汗', '氵', '干', 'water', 'hàn', '汗液；身体排出的汗水', '땀', ('汗', 'hàn', '땀'), 'sweat'),
    ('流', '氵', '㐬', 'water', 'liú', '液体流动；流淌', '흐르다', ('流动', 'liúdòng', '흐르다, 유동하다'), 'flow'),
    ('池', '氵', '也', 'water', 'chí', '池塘；蓄水的地方', '연못; 못', ('池塘', 'chítáng', '연못'), 'pond'),
    ('泥', '氵', '尼', 'water', 'ní', '含水的土；泥土', '진흙', ('泥', 'ní', '진흙'), 'mud'),
    ('吹', '口', '欠', 'mouth', 'chuī', '合拢嘴唇用力呼出气体', '불다', ('吹', 'chuī', '불다'), 'blow'),
    ('咳', '口', '亥', 'mouth', 'ké', '咳嗽', '기침하다', ('咳嗽', 'késou', '기침하다'), 'cough'),
    ('桃', '木', '兆', 'wood', 'táo', '桃树；桃子', '복숭아; 복숭아나무', ('桃', 'táo', '복숭아'), 'peach'),
    ('柳', '木', '卯', 'wood', 'liǔ', '柳树', '버드나무', ('柳树', 'liǔshù', '버드나무'), 'willow'),
    ('坡', '土', '皮', 'earth', 'pō', '倾斜的地面；山坡', '비탈; 경사지다', ('山坡', 'shānpō', '산비탈'), 'slope'),
    ('塔', '土', '荅', 'earth', 'tǎ', '高而分层的建筑物；佛塔', '탑', ('塔', 'tǎ', '탑'), 'tower'),
    ('铃', '钅', '令', 'metal', 'líng', '摇动时发声的小型金属器具', '방울; 종', ('铃', 'líng', '방울, 종'), 'bell'),
    ('饮', '饣', '欠', 'food', 'yǐn', '喝；饮用', '마시다', ('饮料', 'yǐnliào', '음료'), 'drink'),
]


def evidence(h, traditional, kind, semantics, sound, history, modern,
             confidence='supported', roles=None):
    value = {'hanzi': h, 'traditional': traditional, 'kind': kind,
             'semanticParts': semantics, 'phoneticPart': sound,
             'historicalNote': history, 'modernNote': modern,
             'confidence': confidence, 'sources': [source(traditional)],
             'reviewNote': '照片仅说明本卡选取的现代常用义；不能据此反推全部字源。'}
    if roles:
        value['modernRoles'] = roles
    return value


new_evidence = {
 '汗': evidence('汗', '汗', 'phonosemantic', ['水'], '干',
     '字库据早期字形释为从水、干声，表示身体排出的汗液。干在这里提示历史读音，不表示“干燥”。',
     '现代字形为氵＋干。额头汗珠对应今天的“汗”；不要把右部干的独立意义拼进整字。'),
 '流': evidence('流', '流', 'phonosemantic', ['水'], '㐬',
     '字库把早期流分析为水与㐬相合，㐬联系毓的省形和产子的图像，同时指出㐬的表音作用。其历史不能简化为“右边也是流水”。',
     '现代字形为氵＋㐬。流水照片只解释今天“流动”的意义；㐬的现代笔画不是这张照片的直接描摹。'),
 '池': evidence('池', '池', 'phonosemantic', ['水'], '它',
     '字库追溯到从水、它声的沱字；隶变时它与也的形体混同，逐渐形成池，后来池与沱分化。不能直接断言今天的也就是原始声旁。',
     '现代左右结构是氵＋也。池塘照片解释现代常用义；右部也作为今天认字的部件观察。',
     roles={'right': {'label': '现代字形部件', 'detail': '今天写也；字库追溯早期声旁为它，经历隶变后才形成现形。'}}),
 '泥': evidence('泥', '泥', 'phonosemantic', ['水'], '尼',
     '从水、尼声。字库指出早期用作河流水名；湿土是后来通行的意义，不能把本卡泥地照片当作最早造字现场。',
     '现代字形为氵＋尼。湿泥的照片帮助记住现在常用的“泥土”义；尼是历史读音线索。'),
 '吹': evidence('吹', '吹', 'semantic-compound', ['口', '欠'], None,
     '字库把早期字形释为口与欠相合：欠联系张口的人形，表示向外吐气。这一构形中两个部分联系动作意义。',
     '现代字形为口＋欠。照片中的吹气是本卡的现代动作义；这里的欠不能机械标成声旁。'),
 '咳': evidence('咳', '咳', 'phonosemantic', ['口'], '亥',
     '从口、亥声。字库指出古代本义与婴儿的笑声有关；今天ké的“咳嗽”义须与古义及其他读音区分。',
     '本卡只学习ké“咳嗽”。照片是现代咳嗽动作，不能当作古代婴儿笑声的字源图。'),
 '桃': evidence('桃', '桃', 'phonosemantic', ['木'], '兆',
     '从木、兆声，表示桃树，并可指桃的果实。木联系树木，兆主要提示历史读音。',
     '现代字形为木＋兆。桃子照片对应常用果实义；兆的独立意义不等于桃子。'),
 '柳': evidence('柳', '柳', 'phonosemantic', ['木'], '卯',
     '早期字形与木、卯相合，字库列有卯声的解释；其得声关系有不同讨论，早期部件排列也不全同于今天。',
     '现代字形为木＋卯。柳树长枝用于认出现代所指的树种；不要把卯的古形断言为垂柳枝。', confidence='disputed'),
 '坡': evidence('坡', '坡', 'phonosemantic', ['土'], '皮',
     '从土、皮声，表示倾斜的地形。土联系地面，皮提示历史读音。',
     '现代字形为土＋皮。倾斜山坡的照片说明现代词义；右部皮不是山坡表皮的图画。'),
 '塔': evidence('塔', '塔', 'phonosemantic', ['土'], '荅',
     '从土、荅声。字库联系梵语stūpa的音译，先指佛教塔式建筑，后来也指其他高耸建筑物。',
     '现代字形为土＋荅。佛塔照片对应现代建筑物意义；荅的独立“小豆”义不参与这张塔的解释。'),
 '铃': evidence('铃', '鈴', 'simplified', ['金'], '令',
     '繁体鈴从金、令声，表示可发声的金属器具；现代简体把金字旁写作钅。',
     '现代字形为钅＋令。金属小铃的照片说明现代常用义；令在这个字里主要提示历史读音。'),
 '饮': evidence('饮', '飲', 'simplified', ['食'], '欠',
     '字库释甲骨形为人俯身对酒器酉张口饮酒；金文人形改为欠，亦有表音作用，左部酓后来楷化为食。简体飲再写作饮。',
     '现代字形为饣＋欠。本卡只学习yǐn“喝”；喝水照片是现代动作示意，不能把它解释成“食物加打哈欠”。',
     roles={'left': {'label': '简化后字形', 'detail': '饣是食字旁的简体形。早期左部另有酉、酓等形体，不是从最早就写成食。'},
            'right': {'label': '历史声旁', 'detail': '字库说明金文的人形改写为欠，并有表音作用；不能直接套用欠的“欠缺”义。'}}),
}


def component(form, pinyin, korean, meaning, kind, origin, shape,
              confidence='supported', sources=None):
    return {'form': form, 'baseForm': form, 'traditional': form, 'pinyin': pinyin,
            'korean': korean, 'meaningZh': meaning, 'originKind': kind,
            'originNote': origin, 'shapeNote': shape,
            'visualKey': 'component-' + format(ord(form), 'x'),
            'visualCaption': '本图只对照现代部件的真实笔画；历史释形以来源说明为准。',
            'sources': sources or [source(form)], 'confidence': confidence}


new_components = {
 '干': component('干', 'gān', '방패; 천간', '古义有盾牌；也用于天干等', 'uncertain',
     '字库把早期形体联系有装饰的盾牌，并介绍其他解释。不能把古形直接画成“晒干”的物体。',
     '观察现代两横一竖；在汗中主要是历史声旁，不把“干燥”套入汗字。', 'disputed'),
 '㐬': component('㐬', 'liú', '옛 글자의 구성 요소', '见于流等字的古构形部件', 'phonetic-carrier',
     '字库在流条下联系毓的省形、倒子与产子图像，并指出其表音作用；这里不另造一个确定的现代实物义。',
     '按真实㐬字形观察上部与下部三笔；流水照片属于整字流的现代义。', sources=[source('流')]),
 '亥': component('亥', 'hài', '지지의 열두째 글자, 해', '地支第十二位', 'uncertain',
     '早期形体的解释有分歧，字库列举草根、猪等不同说法；本卡不把任一说法当作已经定论的实物图。',
     '保留现代亥的真实轮廓；在咳中联系历史读音，不等于咳嗽的动作。', 'disputed'),
 '卯': component('卯', 'mǎo', '지지의 넷째 글자, 묘', '地支第四位', 'uncertain',
     '字库记录对早期形体有双刀、门等不同解释，字源未形成一致结论。不可因柳字而把卯画成柳枝。',
     '观察现代卯左右两个部分的实际笔形；在柳中按来源理解历史声音关系。', 'disputed'),
 '荅': component('荅', 'dá', '팥; 대답하다', '小豆；古书中也可通答', 'compound',
     '《说文》释小豆，从艸、合声。荅有自己的构形与字义；作为塔的右部时主要提示历史读音。',
     '现代荅为艹在上、合在下；塔的建筑物照片不是荅字的独立象形图。',
     sources=[source('荅', '汉典·荅（含《说文》原文）', 'https://zdic.net/hans/' + quote('荅'))]),
}

characters = load(data_dir / 'characters.json')
character_evidence = load(data_dir / 'character-evidence.json')
components = load(data_dir / 'component-evidence.json')
geometry = load(data_dir / 'glyph-geometry.json')
images = load(data_dir / 'image-manifest.json')
fixture = load(project / 'tests/fixtures/structure-source-lines.json')
index = load(data_dir / 'character-index.json')
legacy = load(data_dir / 'lexicon.json')
photos = load(source_dir / 'restored-new-photos.json')
dictionary_path = workspace / 'work/source_research/makemeahanzi_dictionary.txt'
graphics_path = workspace / 'work/radical-audit/graphics.txt'
cjkvi_path = workspace / 'work/source_research/cjkvi_ids.txt'
dictionary = {r['character']: r for r in map(json.loads, dictionary_path.open())}
graphics = {r['character']: r for r in map(json.loads, graphics_path.open())}
cjkvi = {line.split('\t')[1]: line for line in cjkvi_path.read_text().splitlines()
         if line.startswith('U+') and len(line.split('\t')) >= 3}
new_chars = [r[0] for r in lessons]
assert len(characters) == 171 and len(components) == 152, 'Append exactly once to the reviewed v5 baseline'
assert not set(new_chars) & set(c['hanzi'] for c in characters)
for h in new_chars:
    photo = photos[h]
    image_path = project / 'public' / photo['src'].lstrip('/')
    assert image_path.is_file() and image_path.stat().st_size > 1000, h
    assert hashlib.sha256(image_path.read_bytes()).hexdigest() == photo['sha256'], h
    assert photo['inspection']['status'] == 'visually-inspected', h
assert len({photos[h]['sha256'] for h in new_chars}) == 12

audit = {'accessed': date, 'cjkviSource': cjkvi_url,
         'makeMeAHanziDictionary': 'https://github.com/skishore/makemeahanzi/blob/' + mmh_revision + '/dictionary.txt',
         'makeMeAHanziGraphics': 'https://github.com/skishore/makemeahanzi/blob/' + mmh_revision + '/graphics.txt',
         'sourceFileSha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                              for p in [cjkvi_path, dictionary_path, graphics_path]},
         'characters': {}}


def outline(h, sides=None):
    raw = graphics[h]
    item = {'strokes': raw['strokes'], 'medians': raw['medians']}
    if sides is not None:
        item['sides'] = sides
    points = [p for stroke in item['medians'] for p in stroke]
    xs = [p[0] for p in points]
    ys = [900 - p[1] for p in points]
    item['bounds'] = [min(xs)-80, min(ys)-80, max(xs)-min(xs)+160, max(ys)-min(ys)+160]
    return item


for h, left, right, family, pinyin, meaning, korean, example, scene in lessons:
    ids = '⿰' + left + right
    raw = dictionary[h]
    assert raw['decomposition'] == ids and ids in cjkvi[h].split('\t')[2:], h
    matches = raw['matches']
    assert all(m is not None and len(m) == 1 and m[0] in [0, 1] for m in matches), h
    sides = [m[0] for m in matches]
    assert len(sides) == len(graphics[h]['strokes']) and set(sides) == {0, 1}, h
    word_ids = index.get(h, {}).get('wordIds', [])
    assert word_ids == [w['id'] for w in legacy if h in w['hanzi']], h
    characters.append({'id': 'char-' + format(ord(h), 'x'), 'hanzi': h, 'pinyin': pinyin,
                       'meaningZh': meaning, 'korean': korean, 'radical': family,
                       'otherPart': right, 'firstPart': left, 'secondPart': right,
                       'structure': 'left-right', 'ids': ids,
                       'shapeNarrative': f'现代字形：左部“{left}”，右部“{right}”。完整字形为“{h}”。历史作用见下方来源说明，照片只表示本卡的现代常用义。',
                       'example': dict(zip(['hanzi', 'pinyin', 'korean'], example)),
                       'wordIds': word_ids,
                       'scope': 'hsk' if any(w['hanzi'] == h for w in legacy) else 'extension',
                       'inHskVocabulary': bool(word_ids), 'sceneKey': scene,
                       'source': {'id': 'cjkvi-ids', 'url': cjkvi_url, 'verifiedIds': ids}})
    character_evidence[h] = new_evidence[h]
    geometry[h] = outline(h, sides)
    fixture[h] = {'cjkviRawLine': cjkvi[h], 'makeMeAHanziDecomposition': raw['decomposition']}
    images[h] = {key: photos[h][key] for key in ['src', 'caption', 'alt']}
    images[h]['kind'] = 'AI生成实物或动作示意'
    audit['characters'][h] = {'ids': ids, 'cjkviRawLine': cjkvi[h],
                             'makeMeAHanziDecomposition': raw['decomposition'],
                             'makeMeAHanziMatches': matches,
                             'photoSha256': photos[h]['sha256'],
                             'sourceUrls': [s['url'] for s in new_evidence[h]['sources']]}
for h, value in new_components.items():
    assert h not in components
    components[h] = value
for h in [*new_components, '鈴', '飲']:
    if h not in geometry:
        geometry[h] = outline(h)

assert len(characters) == 183 and len(character_evidence) == 183 and len(images) == 183
assert len(components) == 157
outputs = {'characters': characters, 'character-evidence': character_evidence,
           'component-evidence': components, 'glyph-geometry': geometry, 'image-manifest': images}
for name, values in outputs.items():
    text = json.dumps(values, ensure_ascii=False, separators=(',', ':')) if name == 'glyph-geometry' else json.dumps(values, ensure_ascii=False, indent=2) + '\n'
    (data_dir / f'{name}.json').write_text(text)
    (source_dir / f'{name}.json').write_text(text)
(project / 'tests/fixtures/structure-source-lines.json').write_text(json.dumps(fixture, ensure_ascii=False, indent=2) + '\n')
(source_dir / 'restored-additions-audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
print('Appended 12 source-matched illustrated lessons; totals 183 characters, 157 components.')
