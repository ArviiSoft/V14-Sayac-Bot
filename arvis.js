const { Client, GatewayIntentBits, Partials } = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const Discord = require("discord.js")
const ArvisDB = require("croxydb")
const ayarlar = require(`./config.json`)
const client = new Client({
    intents: INTENTS,
    allowedMentions: {
        parse: ["users"]
    },
    partials: PARTIALS,
    retryLimit: 3
});

global.client = client;
client.commands = (global.commands = []);

const { readdirSync } = require("fs");
const internal = require("stream");
readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,// arviis.
        dm_permission: props.dm_permission,
        type: 1
    });

    console.log(`[YÜKLENDİ] ${props.name}`)

});
readdirSync('./events').forEach(e => {

    const eve = require(`./events/${e}`)
    const name = e.split(".")[0]

    client.on(name, (...args) => {
        eve(client, ...args)
    });
    console.log(`[EVENT] ${name}`)
});
client.login(ayarlar.TOKEN)


client.on("guildMemberAdd", member => {
    let gMesaj = ArvisDB.get(`hgbbGirisMesaj_${member.guild.id}`);
    const kanal = ArvisDB.get(`hgbb_${member.guild.id}`)// arviis.
    if (!kanal) return;

    let embed = new Discord.EmbedBuilder()
        .setTitle(`Vahşi Bir Üye Belirdi!`)
        .setDescription(gMesaj || `<a:elsallama_arvis0011:1048619375655133255> Selamm ${member}, Aramıza Hoş Geldin  

        > Seninle Birlikte **${member.guild.memberCount}** Kişi Olduk`)
        .setThumbnail(member.user.displayAvatarURL())
        .setColor("#03fc07")

    member.guild.channels.cache.get(kanal).send({ embeds: [embed] })
});

client.on("guildMemberRemove", member => {

    let cMesaj = ArvisDB.get(`hgbbCikisMesaj_${member.guild.id}`);// arviis.
    const kanal = ArvisDB.get(`hgbb_${member.guild.id}`)// arviis.
    if (!kanal) return;

    let embed = new Discord.EmbedBuilder()
        .setTitle("Vahşi Üye, Aramızdan Ayrıldı :(")
        .setDescription(cMesaj || `${member} Neden Gittin... <:m_sigara:1048331999712116837>

        > Sensiz **${member.guild.memberCount}** Kişi Kaldık`)
        .setThumbnail(member.user.displayAvatarURL())// arviis.
        .setColor("#fc0303")

    member.guild.channels.cache.get(kanal).send({ embeds: [embed] })
});// arviis.

client.on('interactionCreate', async interaction => {

    const embed = new Discord.EmbedBuilder()
        .setTitle("Yetersiz Yetki")
        .setDescription("> Bu Komutu Kullanabilmek İçin `Kanalları Yönet` Yetkisine Sahip Olman Lazım")
        .setFooter({ text: "arviis." })
        .setColor("#fc0303")

    const embed1 = new Discord.EmbedBuilder()// arviis.
        .setTitle("Başarıyla Sıfırlandı")// arviis.
        .setDescription("> Hoş Geldin Sistemi Başarıyla **Sıfırlandı**")
        .setColor("#03fc07")// arviis.

    const embed2 = new Discord.EmbedBuilder()
        .setTitle("Zaten Sıfırlanmış")// arviis.
        .setDescription("> Hoş Geldin Sistemi Zaten Sıfırlanmış")// arviis.
        .setColor("#fc0303")

    if (!interaction.isButton()) return;

    if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ embeds: [embed], ephemeral: true });
    if (interaction.customId === "kapat1") {
        ArvisDB.delete(`hgbb_${interaction.guild.id}`)
        ArvisDB.delete(`hgbbCikisMesaj_${interaction.guild.id}`)// arviis.
        ArvisDB.delete(`hgbbGirisMesaj_${interaction.guild.id}`)
        interaction.reply({ embeds: [embed1], ephemeral: true })// arviis.
    }
})// arviis.

client.on('interactionCreate', async interaction => {

    let msj = ArvisDB.get(`hgbbCikisMesaj_${interaction.guild.id}`)
    let msj2 = ArvisDB.get(`hgbbGirisMesaj_${interaction.guild.id}`)

    const mesaj = new Discord.EmbedBuilder()
        .setTitle("Ayarlanan Mesaj")
        .setDescription(`📥・**Giriş Mesajı:** ${msj} \n\n📤・**Çıkış Mesajı:** ${msj2}`)
        .setColor("#ebfc03")
// arviis.
    const uyari = new Discord.EmbedBuilder()
        .setTitle("Başarısız")// arviis.
        .setDescription(`Sistem Ayarlı Değil Veya Mesaj Ayarlanmamış`)
        .setColor("#fc0303")
// arviis.
    const embed = new Discord.EmbedBuilder()
        .setTitle("Yetersiz Yetki")// arviis.
        .setDescription("> Bu Komutu Kullanabilmek İçin `Kanalları Yönet` Yetkisine Sahip Olman Lazım")
        .setFooter({ text: "arviis." })
        .setColor("#fc0303")

    if (!interaction.isButton()) return;// arviis.
    if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ embeds: [embed], ephemeral: true });
    if (interaction.customId === "goster") {
        if (!msj) return interaction.reply({ embeds: [uyari], ephemeral: true })
        if (!msj2) return interaction.reply({ embeds: [uyari], ephemeral: true })
        interaction.reply({ embeds: [mesaj], ephemeral: true })
    }
})
