# Raqqa production R8 rules.
# Keep metadata used by annotations/serialization and preserve useful crash traces.
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod,SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# MainActivity is the manifest entry point and the host for the Capacitor bridge.
-keep class com.raqqa.app.MainActivity {
    public <init>();
}

# Capacitor, Firebase, AdMob, and Unity adapters ship their own consumer rules.
# Do not add broad package-wide keep rules: they defeat R8 shrinking/obfuscation.
