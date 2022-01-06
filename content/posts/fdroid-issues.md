---
title: "F-Droid: how is it weakening the Android security model?"
date: 2022-01-02T21:28:31Z
draft: false
tags: ['security', 'android']
---

Many of us in GrapheneOS community channels suggest avoiding F-Droid, the alternative app repository dedicated to free and open-source software. We don't strictly oppose its use nor are we against the usage of free software, but we often emphasize major issues specifically with F-Droid that can harm the security of your device and the FOSS app ecosystem.

Before we start, a few things to keep in mind:

- The main goal of this write-up was to inform users so they can make responsible choices, not to trash someone else's work. Please don't misinterpret this article's intention.
- You have your own reasons for using open-source software which won't be discussed here. Beware though that open-source does not equal security and may sometimes be the perfect Trojan Horse for exploits. It's just a development model like any other.
- A lot of information in this article is sourced from official and trusted sources, but you're welcome to do your own research. As the author of this article, I'm only interested in facts and not ideologies.

## 1. The trusted party problem
To understand why this is a problem, you'll have to understand a bit about F-Droid's architecture, the things it does very differently from other app repositories, and the [Android platform security model](https://arxiv.org/pdf/1904.05572.pdf).

Unlike other repositories, F-Droid signs all the apps in the main repository with **its own signing keys** at the exception of the very few [reproducible builds](https://f-droid.org/en/docs/Reproducible_Builds/). A signature is a mathematical scheme that guarantees the authenticity of the applications you download. Upon the installation of an app, Android pins the signature across the entire OS (including user profiles): that's what we call a *trust-on-first-use* model since all subsequent updates of the app must have the corresponding signature to be installed.

Normally, the developer is supposed to sign their own app prior to its upload on a distribution channel, whether that is a website or a traditional repository (or both). You don't have to trust the source (usually recommended by the developer) except for the first installation: future updates will have their authenticity cryptographically guaranteed. The issue with F-Droid is that all apps are signed by the same party (F-Droid) which is also not the developer. You're now adding another party you'll have to trust, which isn't ideal: **the fewer parties, the better**.

On the other hand, Play Store now manages the app signing keys too, as [Play App Signing](https://developer.android.com/studio/publish/app-signing#app-signing-google-play) is required for app bundles which are required for new apps since August 2021. These signing keys can be uploaded or automatically generated, and are securely stored by [Google Cloud Key Management Service](https://services.google.com/fh/files/misc/security_whitepapers_march2018.pdf). It should be noted that the developer still has to sign the app with **an upload key** so that Google can verify its authenticity before signing it with the app signing key. For apps created before August 2021 that may have [not opted in Play App Signing](https://developer.android.com/studio/publish/app-signing#opt-out) yet, the developer still manages the private key and is responsible for its security, as a compromised private key can allow a third party to sign and distribute malicious code.

F-Droid also requires that the source code of the app is exempt from any proprietary library or ad service, according to their [inclusion policy](https://f-droid.org/en/docs/Inclusion_Policy/). Usually, that means that some developers will have to maintain a slightly different version of their codebase that should comply with F-Droid's requirements. Besides, their "quality control" offers **close to no guarantees** as having access to the source code doesn't mean it can be easily proofread. Users should not think of the F-Droid main repository as free of malicious apps, yet unfortunately many are inclined to believe this.

## 2. Slow and irregular updates
Since you're adding one more party to the mix, that party is now responsible for delivering proper builds of the app: it's a common thing among traditional Linux distributions and their packaging system. They have to catch up with *upstream* on a regular basis, but very few do it well (Arch Linux comes to my mind). Others, like Debian, prefer making extensive *downstream* changes and delivering security fixes for a subset of vulnerabilities assigned to a CVE (yeah, it's as bad as it sounds, but that's another topic).

Not only do F-Droid require specific changes for the app to comply with its inclusion policy, which often leads to more maintenance work, they also have a rather strange way of triggering new builds. Part of their build process seems to be [automated](https://f-droid.org/en/docs/FAQ_-_App_Developers/), which is the least you could expect. Now here's the thing: app signing keys are on an **air-gapped system** (meaning it's disconnected from any network), which forces an irregular update cycle where a human has to manually trigger the signing process. It is far from an ideal situation, and you may argue it's the least to be expected since by entrusting all the signing keys to one party, you could also introduce a single point of failure. Should their system be compromised, it could lead to serious security issues affecting plenty of users.

Considering all this, and the fact that their build process is often broken using outdated tools, you have to expect **far slower updates** compared to a traditional distribution system. Slow updates mean that you will be exposed to security vulnerabilities more often than you should've been. It would be unwise to have a full browser updated through the F-Droid official repository, for instance. F-Droid third-party repositories somewhat mitigate the issue of slow updates since they can be managed directly by the developer. It isn't ideal either as you will see below.

## 3. Low target API level (SDK) for client & apps
SDK stands for *Software Development Kit* and is the collection of software to build apps for a given platform. On Android, a higher SDK level means you'll be able to make use of modern API levels of which each iteration brings **security and privacy improvements**. For instance, API level 31 makes use of all these improvements on Android 12.

As you may already know, Android has a strong sandboxing model where each application is sandboxed. You could say that an app compiled with the highest API level benefits from all the latest improvements brought to the app sandbox; as opposed to outdated apps compiled with older API levels, which have a **weaker sandbox**.

```
# b/35917228 - /proc/misc access
# This will go away in a future Android release
allow untrusted_app_25 proc_misc:file r_file_perms;

# Access to /proc/tty/drivers, to allow apps to determine if they
# are running in an emulated environment.
# b/33214085 b/33814662 b/33791054 b/33211769
# https://github.com/strazzere/anti-emulator/blob/master/AntiEmulator/src/diff/strazzere/anti/emulator/FindEmulator.java
# This will go away in a future Android release
allow untrusted_app_25 proc_tty_drivers:file r_file_perms;
```

This is a mere sample of the [SELinux exceptions](https://android.googlesource.com/platform/system/sepolicy/+/refs/tags/android-12.0.0_r21/private) that have to be made on older API levels so that you can understand why it matters.

It turns out the official F-Droid client doesn't care much about this since it lags behind quite a bit, **[targeting the API level 25](https://gitlab.com/fdroid/fdroidclient/-/blob/2a8b16683a2dbee16d624a58e7dd3ea1da772fbd/app/build.gradle#L33)** (of which some SELinux exceptions were shown above). As a workaround, some users recommended third-party clients such as [Foxy Droid](https://f-droid.org/en/packages/nya.kitsunyan.foxydroid/) or [Aurora Droid](https://f-droid.org/en/packages/com.aurora.adroid/). While these clients might be technically better, they're poorly maintained for some, and they also introduce yet another party to the mix.

Furthermore, F-Droid **doesn't enforce a minimum target SDK** for the official repository. Play Store [does that quite aggressively](https://developer.android.com/google/play/requirements/target-sdk) for new app updates, and while it may seem bothersome, it's a necessity to keep the app ecosystem modern and thus healthy. F-Droid's approach sends the wrong message to developers (and even users) because they should care about it, and this is why many of us think it may be even harmful to the FOSS ecosystem. Backward compatibility is often the enemy of security, and while there's a middle-ground for convenience and obsolescence, it shouldn't be exaggerated.

As a result of this philosophy, the main repository of F-Droid is filled with obsolete apps from another era.

## 4. General lack of good practices
The F-Droid client allows multiple repositories to coexist within the same app. Many of the issues highlighted above were focused on the main official repository which most of the F-Droid users will use anyway. However, having **other repositories in a single app also violates the security model of Android** which was not designed for this at all. As a matter of fact, the new unattended update API from Android 12 that allows seamless app updates for app repositories without [privileged access](https://f-droid.org/en/packages/org.fdroid.fdroid.privileged/) to the system (such an approach is not compatible with the security model) won't work with F-Droid. It should be mentioned that [Droid-ify](https://github.com/Iamlooker/Droid-ify/issues/20) is trying to figure out a way to make it work, although the underlying issues about the F-Droid infrastructure remain.

Their client also lacks **TLS certificate pinning**, unlike Play Store which does that for all connections to Google. Certificate pinning is a way for apps to increase the security of their connection to services [by providing the hashes](https://developer.android.com/training/articles/security-config#CertificatePinning) of known-good certificates for these services instead of trusting pre-installed CAs. This can avoid some cases where an interception (*man-in-the-middle* attack) could be possible and lead to various security issues considering you're trusting the app to deliver you other apps.

It is an important security feature that is also straightforward to implement. See how GrapheneOS pins both root and CA certificates in [Auditor](https://github.com/GrapheneOS/Auditor) for their attestation service:

```
<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <base-config cleartextTrafficPermitted="false"/>
    <domain-config>
        <domain includeSubdomains="true">attestation.app</domain>
        <pin-set>
            <!-- ISRG Root X1 -->
            <pin digest="SHA-256">C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=</pin>
            <!-- ISRG Root X2 -->
            <pin digest="SHA-256">diGVwiVYbubAI3RW4hB9xU8e/CH2GnkuvVFZE8zmgzI=</pin>
            <!-- Let's Encrypt R3 -->
            <pin digest="SHA-256">jQJTbIh0grw0/1TkHSumWb+Fs0Ggogr621gT3PvPKG0=</pin>
            <!-- Let's Encrypt E1 -->
            <pin digest="SHA-256">J2/oqMTsdhFWW/n85tys6b4yDBtb6idZayIEBx7QTxA=</pin>
            ...
        </pin-set>
    </domain-config>
</network-security-config>
```

F-Droid also has a problem regarding the adoption of **[new signature schemes](https://source.android.com/security/apksigning)** as they [held out on the v1 signature scheme](https://forum.f-droid.org/t/why-f-droid-is-still-using-apk-signature-scheme-v1/10602) (which was [horrible](https://www.xda-developers.com/janus-vulnerability-android-apps/) and deprecated since 2017) until they were forced by Android 11 requirements to support the newer v2/v3 schemes. Quite frankly, this is straight-up bad, and **signing APKs with GPG** is no better considering [how bad PGP and its reference implementation GPG are](https://latacora.micro.blog/2019/07/16/the-pgp-problem.html) (even Debian [moved away from it](https://wiki.debian.org/Teams/Apt/Spec/AptSign)).

For some reason, their website has always been hosting an [outdated APK of F-Droid](https://forum.f-droid.org/t/why-does-the-f-droid-website-nearly-always-host-an-outdated-f-droid-apk/6234), and this is still the case today. "Stability" seems to be the main reason mentioned, which doesn't make sense.

Finally, F-Droid shows a list of the [low-level permissions](https://developer.android.com/reference/android/Manifest.permission) for each app: these low-level permissions are usually grouped in the standard high-level permissions and special toggles that are explicitly based on a type of sensitive data. While showing a list of low-level permissions could be useful information for a developer, it's often a misguided and inaccurate approach for the end-user. Apps have to [request the standard permissions at runtime](https://developer.android.com/guide/topics/permissions/overview#runtime) and do not get them simply by being installed, so knowing all the "under the hood" permissions is not useful and makes the permission model unnecessarily confusing.

## Conclusion: what should you do?
F-Droid **weakens the security model of Android substantially** for all of the reasons above. If security matters to you, it should not be used. If you don't care or if you'll use it knowingly, then it's up to you. While they could make some easy improvements, I don't think F-Droid is in an ideal situation to solve all of these issues because some of them are **inherent flaws** in their architecture.

F-Droid is not the only way to get and support open-source apps. Sure, it can help you in finding one that you wouldn't have known existed otherwise. Many developers also publish their FOSS apps on the **Play Store** or their website directly. Most of the time, releases are available on **GitHub**, which is great since each GitHub releases page has an atom feed. Nonetheless, I'd still recommend using **Play Store for top-notch security** as it does additional checks, and it is even perfectly usable on GrapheneOS with their [sandboxed Play services](https://grapheneos.org/usage#sandboxed-play-services) compatibility layer.

If you don't have Play services installed, you can use a third-party Play Store client called **[Aurora Store](https://auroraoss.com/)**. Aurora Store has some issues of its own, and some of them overlap in fact with F-Droid. Aurora Store somehow still requires [the legacy storage permission](https://gitlab.com/AuroraOSS/AuroraStore/-/blob/26f5d4fd558263a89baee4c3cbe1d220913da104/app/src/main/AndroidManifest.xml#L28-32), has yet to [implement certificate pinning](https://gitlab.com/AuroraOSS/AuroraStore/-/issues/697), has been known to sometimes retrieve wrong versions of apps, and [distributed account tokens](https://gitlab.com/AuroraOSS/AuroraStore/-/issues/722) over [cleartext HTTP](https://gitlab.com/AuroraOSS/AuroraStore/-/issues/734) until fairly recently; not that it matters much since tokens were designed to be shared between users, which is already concerning. I'd recommend against using the shared "anonymous" accounts feature: you should make your own throwaway account with minimal information.

You should also keep an eye on the great work **GrapheneOS** does on [their future app repository](https://github.com/GrapheneOS/Apps). It will be a simple, secure, modern app repository for a curated list of high-quality apps, some of which will have their own builds (for instance, Signal still uses their [original 1024-bits RSA key](https://github.com/signalapp/Signal-Android/issues/9362) that has never been rotated since then). Inspired by this work, a GrapheneOS community member is developing a more generic app repository called [Accrescent](https://twitter.com/lberrymage/status/1475307653089792003).

*Thanks to the GrapheneOS community for proofreading this article.*
